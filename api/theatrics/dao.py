import aioes

from collections import namedtuple

from .connections import elastic
from .settings import ELASTICSEARCH_INDEX
from .utils.collections import compact


__all__ = [
    'search', 'fetch_item', 'fetch_multiple_items', 'expand_item',
    'expand_multiple_items', 'simplify_item', 'SearchResults'
]


SearchResults = namedtuple('SearchResults', 'items count took')


async def search(body, type_=None, page=1, page_size=20, fields=None):
    body['size'] = page_size
    body['from'] = (page - 1) * page_size
    if fields:
        body['_source'] = fields

    response = await elastic.search(ELASTICSEARCH_INDEX, type_, body)
    hits = response['hits']
    took = response['took']
    count = hits['total']
    items = list(map(simplify_item, hits['hits']))
    return SearchResults(items, count, took)


async def fetch_item(type_, id_, fields=None):
    kwargs = {}
    if fields:
        kwargs['_source'] = ','.join(fields)

    try:
        response = await elastic.get(ELASTICSEARCH_INDEX, id_, type_, **kwargs)
    except aioes.NotFoundError:
        return None
    else:
        return simplify_item(response)


async def fetch_multiple_items(type_, ids, fields=None):
    kwargs = {}
    if fields:
        kwargs['_source'] = ','.join(fields)

    response = await elastic.mget(
        {'ids': ids}, ELASTICSEARCH_INDEX, type_, **kwargs)
    return [simplify_item(doc) for doc in response['docs']]


async def expand_item(item, relations):
    for field, (type_, subfields) in relations.items():
        id_ = item.get(field)
        if id_ is not None:
            item[field] = await fetch_item(type_, id_, subfields)
    return item


async def expand_multiple_items(item_list, relations):
    for field, (type_, subfields) in relations.items():
        related_ids = list(compact(item.get(field) for item in item_list))
        if not related_ids:
            continue

        related_items = await fetch_multiple_items(type_, related_ids, subfields)
        related_by_id = {item['id']: item for item in related_items}

        for item in item_list:
            if field in item:
                item[field] = related_by_id.get(item[field])

    return item_list


def simplify_item(item):
    if 'found' in item and not item['found']:
        return None

    simple = item['_source']
    simple['id'] = int(item['_id'])  # our ids are integers
    simple['type'] = item['_type']
    if 'highlight' in item:
        simple['highlight'] = {k: v[0] for k, v in item['highlight'].items()}
    return simple
