from math import ceil

from aiohttp import web
from marshmallow import Schema, fields
from marshmallow.validate import Range
from funcy import project

from theatrics.utils.fields import CommaSeparatedList
from theatrics.utils.uri import build_uri
from theatrics.utils.handlers import with_params
from theatrics.dao import (
    search,
    fetch_item,
    expand_item,
    expand_multiple_items,
)


class ListParams(Schema):
    page_size = fields.Integer(validate=Range(1, 100))
    page = fields.Integer(validate=Range(1))
    expand = CommaSeparatedList(fields.String())
    fields = CommaSeparatedList(fields.String())


class ItemParams(Schema):
    expand = CommaSeparatedList(fields.String())
    fields = CommaSeparatedList(fields.String())


@with_params(ItemParams)
async def get_item(request, type_, id_, relations={},
                   fields=(), expand=()):
    item = await fetch_item(type_, id_, fields)
    if item is None:
        raise web.HTTPNotFound()
    expanding_relations = project(relations, expand)
    return await expand_item(item, expanding_relations)


@with_params(ListParams)
async def get_list(request, query, type_=None, relations={},
                   page=1, page_size=20, fields=(), expand=()):
    items, count, took = await search(query, type_, page, page_size, fields)

    expanding_relations = project(relations, expand)
    items = await expand_multiple_items(items, expanding_relations)

    previous = get_previous_page_uri(request, page, page_size)
    next_ = get_next_page_uri(request, page, page_size, count)

    return {
        'count': count,
        'items': items,
        'took': took,
        'previous': previous,
        'next': next_,
    }


def get_previous_page_uri(request, page, page_size):
    if page > 2:
        return build_uri(request.path, request.query_string, page=page - 1)
    elif page == 2:
        return build_uri(request.path, request.query_string, page=None)
    else:
        return None


def get_next_page_uri(request, page, page_size, count):
    if page < ceil(count / page_size):
        return build_uri(request.path, request.query_string, page=page + 1)
    else:
        return None
