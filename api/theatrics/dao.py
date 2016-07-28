import aioes
from funcy import collecting, compact, is_seqcont

from .connections import elastic
from .settings import ELASTICSEARCH_INDEX
from .utils.functional import containing


__all__ = [
    'search', 'fetch_item', 'fetch_multiple_items', 'expand_item',
    'expand_multiple_items', 'simplify_item'
]


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
    return items, count, took


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
    return (await expand_multiple_items([item], relations))[0]


async def expand_multiple_items(item_list, relations):
    for field, (type_, subfields) in relations.items():
        path = field.split('.')
        field = path[-1]
        items_with_field = _find_items_having_path(item_list, path)
        if not items_with_field:
            continue

        related_ids = [item[field] for item in items_with_field]
        related_items = await fetch_multiple_items(type_, related_ids, subfields)
        related_by_id = {item['id']: item for item in compact(related_items)}

        for item in items_with_field:
            item[field] = related_by_id.get(item[field])

    return item_list


@collecting
def _find_items_having_path(item_list, path):
    assert len(path) > 0

    field, rest = path[0], path[1:]
    if len(path) == 1:
        yield from filter(containing(field), item_list)
        return

    for item in item_list:
        try:
            value = item[field]
        except:
            continue
        else:
            if is_seqcont(value):
                yield from _find_items_having_path(value, rest)
            else:
                yield from _find_items_having_path([value], rest)


def simplify_item(item):
    if 'found' in item and not item['found']:
        return None

    simple = item['_source']
    simple['id'] = int(item['_id'])  # our ids are integers
    simple['type'] = item['_type']
    if 'highlight' in item:
        simple['highlight'] = {k: v[0] for k, v in item['highlight'].items()}
    return simple
