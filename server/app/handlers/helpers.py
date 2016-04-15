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
    fields = fields.String()


def item_handler(type_):
    def decorator(f):
        @wraps(f)
        async def wrapper(request):
            id_ = await f(request)
            try:
                response = await elastic.get(ELASTICSEARCH_INDEX, id_, type_)
            except aioes.NotFoundError:
                return web.HTTPNotFound()
            else:
                item = simplify_item(response)
                return web.Response(
                    text=json.dumps(item, ensure_ascii=False),
                    content_type='application/json',
                )
        return wrapper
    return decorator


def list_handler(params_schema, type_=None):
    def decorator(f):
        @wraps(f)
        async def wrapper(request):
            schema = params_schema()
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

            query = await f(request, **params)

            body = {
                'size': size,
                'from': from_,
                'query': query,
            }
            if fields:
                body['_source'] = fields.split(',')

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


def simplify_item(hit):
    simple = hit['_source']
    simple['id'] = int(hit['_id'])  # our ids are integers
    simple['type'] = hit['_type']
    if 'highlights' in hit:
        simple['highlights'] = hit['highlights']
    return simple


def build_uri(path, query_string, **params):
    query = parse_qs(query_string)
    for k, v in params.items():
        if v is None and k in query:
            del query[k]
        elif v is not None:
            query[k] = v
    new_qs = urlencode(query, True)
    return '{}?{}'.format(path, new_qs) if new_qs else path
