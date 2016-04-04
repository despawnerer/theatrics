import aiohttp
from aioes import Elasticsearch

from .importer import Importer
from .kudago import KudaGo


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_INDEX_NAME = 'theatrics'


async def update():
    async with aiohttp.ClientSession() as http_client:
        elastic = Elasticsearch(ELASTIC_ENDPOINTS)
        kudago = KudaGo(http_client)
        importer = Importer(kudago, elastic, ELASTIC_INDEX_NAME)
        return await importer.go()
