import aiohttp
import os.path
from datetime import datetime
from aioes import Elasticsearch

from .importer import import_data
from .kudago import KudaGo
from .utils import read_json_file


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_ALIAS = 'theatrics'


# commands

async def initialize():
    elastic = Elasticsearch(ELASTIC_ENDPOINTS)
    index_name = await create_new_index(elastic)
    await switch_alias_to_index(elastic, ELASTIC_ALIAS, index_name)


async def update(since):
    async with aiohttp.ClientSession() as http_client:
        elastic = Elasticsearch(ELASTIC_ENDPOINTS)
        kudago = KudaGo(http_client)
        await import_data(kudago, elastic, ELASTIC_ALIAS, since=since)


# index management

async def create_new_index(elastic):
    module_path = os.path.dirname(__file__)
    config_filename = os.path.join(module_path, 'configuration', 'index.json')
    index_configuration = read_json_file(config_filename)
    index_name = generate_index_name()
    await elastic.indices.create(index_name, index_configuration)
    return index_name


async def switch_alias_to_index(elastic, alias_name, index_name):
    existing_aliases = await elastic.indices.get_aliases(name=alias_name)
    actions = [{
        'add': {
            'index': index_name,
            'alias': alias_name
        }
    }]
    for existing_index_name in existing_aliases:
        actions.append({
            'remove': {
                'index': existing_index_name,
                'alias': alias_name,
            }
        })

    await elastic.indices.update_aliases(actions)


def generate_index_name():
    return '{}-{}'.format(ELASTIC_ALIAS, int(datetime.now().timestamp()))
