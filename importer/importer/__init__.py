import asyncio
import aiohttp
import aioes
import os.path
from datetime import datetime
from aioes import Elasticsearch

from .importer import import_data
from .kudago import KudaGo
from .utils import read_json_file
from .settings import ELASTICSEARCH_ENDPOINTS, ELASTICSEARCH_ALIAS


# commands

async def migrate():
    elastic = Elasticsearch(ELASTICSEARCH_ENDPOINTS)
    index_name = await create_new_index(elastic)
    if await elastic.indices.exists(ELASTICSEARCH_ALIAS):
        futures = []
        async for hit in IndexScanner(elastic, ELASTICSEARCH_ALIAS):
            doc = hit['_source']
            id_ = hit['_id']
            type_ = hit['_type']
            futures.append(asyncio.ensure_future(
                elastic.index(index_name, type_, doc, id=id_)
            ))
        await asyncio.wait(futures)
    await switch_alias_to_index(elastic, ELASTICSEARCH_ALIAS, index_name)


async def update(since):
    async with aiohttp.ClientSession() as http_client:
        elastic = Elasticsearch(ELASTICSEARCH_ENDPOINTS)
        kudago = KudaGo(http_client)
        await import_data(kudago, elastic, ELASTICSEARCH_ALIAS, since=since)


async def reimport():
    async with aiohttp.ClientSession() as http_client:
        elastic = Elasticsearch(ELASTICSEARCH_ENDPOINTS)
        kudago = KudaGo(http_client)
        index_name = await create_new_index(elastic)
        await import_data(kudago, elastic, index_name)
        await switch_alias_to_index(elastic, ELASTICSEARCH_ALIAS, index_name)


# index management

class IndexScanner:
    def __init__(self, elastic, index_name):
        self.elastic = elastic
        self.index_name = index_name
        self.buffer = None
        self.scroll_id = None

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if self.scroll_id is None:
            scroll_data = await self.elastic.search(self.index_name, scroll='1m')
            self.scroll_id = scroll_data['_scroll_id']

        if not self.buffer:
            response = await self.elastic.scroll(self.scroll_id, scroll='1m')
            self.buffer = response['hits']['hits']

        if self.buffer:
            return self.buffer.pop(0)
        else:
            raise StopAsyncIteration


async def create_new_index(elastic):
    module_path = os.path.dirname(__file__)
    config_filename = os.path.join(module_path, 'configuration', 'index.json')
    index_configuration = read_json_file(config_filename)
    index_name = generate_index_name()
    await elastic.indices.create(index_name, index_configuration)
    return index_name


async def switch_alias_to_index(elastic, alias_name, index_name):
    try:
        existing_aliases = await elastic.indices.get_alias(name=alias_name)
    except aioes.NotFoundError:
        existing_aliases = []

    actions = []
    for existing_index_name in existing_aliases:
        actions.append({
            'remove': {
                'index': existing_index_name,
                'alias': alias_name,
            }
        })
    actions.append({
        'add': {
            'index': index_name,
            'alias': alias_name
        }
    })

    await elastic.indices.update_aliases({'actions': actions})


def generate_index_name():
    return '{}-{}'.format(ELASTICSEARCH_ALIAS, int(datetime.now().timestamp()))
