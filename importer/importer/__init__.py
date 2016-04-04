import aiohttp
import os.path
from datetime import datetime
from aioes import Elasticsearch

from .importer import Importer
from .kudago import KudaGo
from .utils import read_json_file


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_ALIAS = 'theatrics'


async def create():
    elastic = Elasticsearch(ELASTIC_ENDPOINTS)
    module_path = os.path.dirname(__file__)
    config_filename = os.path.join(module_path, 'configuration', 'index.json')
    index_configuration = read_json_file(config_filename)

    alias_name = ELASTIC_ALIAS
    index_name = generate_index_name()

    await elastic.indices.create(index_name, index_configuration)
    await elastic.indices.put_alias(alias_name, index_name)


async def update():
    async with aiohttp.ClientSession() as http_client:
        elastic = Elasticsearch(ELASTIC_ENDPOINTS)
        kudago = KudaGo(http_client)
        today = datetime.now().replace(hour=0, minute=0, microsecond=0)
        importer = Importer(kudago, elastic, ELASTIC_ALIAS, since=today)
        return await importer.go()


def generate_index_name():
    return '{}-{}'.format(ELASTIC_ALIAS, int(datetime.now().timestamp()))
