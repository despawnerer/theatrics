import aiohttp

from .importer import Importer


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_INDEX = 'theatrics'


async def update():
    with aiohttp.ClientSession() as http_client:
        importer = Importer(ELASTIC_INDEX, ELASTIC_ENDPOINTS, http_client)
        return await importer.go()
