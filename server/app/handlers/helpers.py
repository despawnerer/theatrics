import json
from urllib.parse import parse_qs, urlencode
from math import ceil
from functools import wraps

import aioes
from aiohttp import web
from marshmallow import Schema, fields
from marshmallow.validate import Range

from ..connections import elastic
from ..consts import ELASTICSEARCH_INDEX


class ListParams(Schema):
    page_size = fields.Integer(validate=Range(1, 50))
    page = fields.Integer(validate=Range(1))
    expand = fields.String()
    fields = fields.String()


class ItemParams(Schema):
    expand = fields.String()
    fields = fields.String()


def item_handler(type_, params_schema_cls=ItemParams, relations={}):
    def decorator(f):
        @wraps(f)
        async def wrapper(request):
            schema = params_schema_cls()
            result = schema.load(request.GET)
            if result.errors:
                return web.HTTPBadRequest(
                    text=json.dumps({'errors': result.errors}, ensure_ascii=False),
                    content_type='application/json',
                )

            params = result.data

            fields = params.pop('fields', None)

            expand = params.pop('expand', None)
            expand = expand.split(',') if expand else []

            kwargs = {}
            if fields:
                kwargs['_source'] = fields

            id_ = await f(request)
            try:
                response = await elastic.get(
                    ELASTICSEARCH_INDEX, id_, type_, **kwargs)
            except aioes.NotFoundError:
                return web.HTTPNotFound()

            item = simplify_item(response)

            for related_field in expand:
                doc_type, subfields = relations[related_field]
                if fields and related_field in fields:
                    item = (await expand_related_items(
                        [item], related_field, doc_type, subfields))[0]

            return web.Response(
                text=json.dumps(item, ensure_ascii=False),
                content_type='application/json',
            )
        return wrapper
    return decorator


def list_handler(type_=None, params_schema_cls=ListParams, relations={}):
    def decorator(f):
        @wraps(f)
        async def wrapper(request):
            schema = params_schema_cls()
            result = schema.load(request.GET)
            if result.errors:
                return web.HTTPBadRequest(
                    text=json.dumps({'errors': result.errors}, ensure_ascii=False),
                    content_type='application/json',
                )

            params = result.data

            page = params.pop('page', 1)
            size = params.pop('page_size', 20)
            from_ = (page - 1) * size

            fields = params.pop('fields', None)
            fields = fields.split(',') if fields else []

            expand = params.pop('expand', None)
            expand = expand.split(',') if expand else []

            query = await f(request, **params)

            body = {
                'size': size,
                'from': from_,
                'query': query,
            }
            if fields:
                body['_source'] = fields

            response = await elastic.search(ELASTICSEARCH_INDEX, type_, body)
            hits = response['hits']

            count = hits['total']
            items = list(map(simplify_item, hits['hits']))
            previous = (
                build_uri(request.path, request.query_string, page=page - 1)
                if page > 2 else
                build_uri(request.path, request.query_string, page=None)
                if page == 2 else
                None
            )
            next_ = (
                build_uri(request.path, request.query_string, page=page + 1)
                if page < ceil(count / size) else None
            )

            for related_field in expand:
                doc_type, subfields = relations[related_field]
                if fields and related_field in fields:
                    items = await expand_related_items(
                        items, related_field, doc_type, subfields)

            return web.Response(
                text=json.dumps({
                    'count': count,
                    'items': items,
                    'previous': previous,
                    'next': next_,
                }, ensure_ascii=False),
                content_type='application/json',
            )
        return wrapper
    return decorator


async def expand_related_items(item_list, field, doc_type, subfields):
    id_list = list(compact(pluck(field, item_list)))
    if not id_list:
        return item_list

    response = await elastic.mget(
        {'ids': id_list},
        ELASTICSEARCH_INDEX,
        doc_type,
        _source=','.join(subfields)
    )
    related_items = {
        item['id']: item for item in
        map(simplify_item, response['docs'])
    }
    for item in item_list:
        if field in item:
            item[field] = related_items.get(item[field])

    return item_list


def simplify_item(hit):
    simple = hit['_source']
    simple['id'] = int(hit['_id'])  # our ids are integers
    simple['type'] = hit['_type']
    if 'highlights' in hit:
        simple['highlights'] = hit['highlights']
    return simple


def pluck(item, dict_list):
    result = []
    for d in dict_list:
        result.append(d.get(item))
    return result


def compact(iterable):
    return filter(None, iterable)


def build_uri(path, query_string, **params):
    query = parse_qs(query_string)
    for k, v in params.items():
        if v is None and k in query:
            del query[k]
        elif v is not None:
            query[k] = v
    new_qs = urlencode(query, True)
    return '{}?{}'.format(path, new_qs) if new_qs else path
