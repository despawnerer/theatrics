import asyncio
import aiohttp
import aioes
import os.path
from datetime import datetime

from .importer import import_data
from .kudago import KudaGo
from .utils import read_json_file, wait_for_all_services
from .settings import ELASTICSEARCH_ENDPOINTS, ELASTICSEARCH_ALIAS


# commands

async def migrate():
    print("Starting migration...")
    elastic = await connect_to_elasticsearch()

    print("Creating new index...")
    index_name = await create_new_index(elastic)

    if await elastic.indices.exists(ELASTICSEARCH_ALIAS):
        print("Reindexing data from previous index...")
        futures = []
        async for hit in IndexScanner(elastic, ELASTICSEARCH_ALIAS):
            doc = hit['_source']
            id_ = hit['_id']
            type_ = hit['_type']
            futures.append(asyncio.ensure_future(
                elastic.index(index_name, type_, doc, id=id_)
            ))
        if futures:
            await asyncio.wait(futures)

    print("Switching to new index...")
    await switch_alias_to_index(elastic, ELASTICSEARCH_ALIAS, index_name)

    print("Done.")
    elastic.close()


async def update(since):
    print(
        "Updating events since {}...".format(since)
        if since else "Updating all events..."
    )

    async with aiohttp.ClientSession() as http_client:
        elastic = await connect_to_elasticsearch()
        kudago = KudaGo(http_client)
        await import_data(kudago, elastic, ELASTICSEARCH_ALIAS, since=since)

    print("Done.")
    elastic.close()


async def reimport():
    print("Starting reimport")
    elastic = await connect_to_elasticsearch()

    print("Creating new index...")
    index_name = await create_new_index(elastic)

    print("Importing data...")
    async with aiohttp.ClientSession() as http_client:
        kudago = KudaGo(http_client)
        await import_data(kudago, elastic, index_name)

    print("Switching to new index")
    await switch_alias_to_index(elastic, ELASTICSEARCH_ALIAS, index_name)

    print("Done.")
    elastic.close()


# index management

async def connect_to_elasticsearch():
    print("Connecting to Elasticsearch...")

    await wait_for_all_services(ELASTICSEARCH_ENDPOINTS, timeout=10)
    elastic = aioes.Elasticsearch(ELASTICSEARCH_ENDPOINTS)
    await elastic.cluster.health(wait_for_status='yellow', timeout='5s')
    return elastic


class IndexScanner:
    def __init__(self, elastic, index_name, scroll_time='1m'):
        self.elastic = elastic
        self.index_name = index_name
        self.scroll_time = scroll_time
        self.buffer = None
        self.scroll_id = None

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if self.scroll_id is None:
            response = await self.elastic.search(
                self.index_name,
                scroll=self.scroll_time,
            )
            self.scroll_id = response['_scroll_id']
            self.buffer = response['hits']['hits']
        elif not self.buffer:
            response = await self.elastic.scroll(
                self.scroll_id,
                scroll=self.scroll_time,
            )
            self.scroll_id = response['_scroll_id']
            self.buffer = response['hits']['hits']

        if self.buffer:
            return self.buffer.pop(0)
        else:
            await self.elastic.clear_scroll(self.scroll_id)
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
