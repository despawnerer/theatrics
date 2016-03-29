import asyncio
import aiohttp
import aioes

from collector.kudago import KudaGo
from collector.fetch import fetch_theater_event_pages, fetch_theater_place_pages
from collector.transform import transform_event, transform_place


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_INDEX = 'theatrics'

DEBUG = True


async def go():
    with aiohttp.ClientSession() as http_client:
        kudago = KudaGo(http_client)
        elastic = aioes.Elasticsearch(ELASTIC_ENDPOINTS)

        if DEBUG:
            await elastic.indices.delete(ELASTIC_INDEX)

        event_ids, place_ids = await asyncio.gather(
            collect(elastic, fetch_theater_event_pages(kudago),
                    transform_event, 'event'),
            collect(elastic, fetch_theater_place_pages(kudago),
                    transform_place, 'place'),
        )

        print("Total events indexed:", len(event_ids))
        print("Total places indexed:", len(place_ids))


async def collect(elastic, pages_iterator, transform, doc_type):
    print("Collecting %ss" % doc_type)
    have = 0
    index_futures = []
    async for page in pages_iterator:
        have += len(page)
        print("Received %d/%d %ss" % (have, pages_iterator.count, doc_type))
        for data in page:
            coro = index(elastic, transform, data, doc_type)
            index_futures.append(asyncio.ensure_future(coro))
    return await asyncio.gather(*index_futures)


async def index(elastic, transform, data, doc_type):
    doc = transform(data)
    doc_id = doc['id']
    result = await elastic.index(ELASTIC_INDEX, doc_type, doc, id=doc_id)
    return doc_id


loop = asyncio.get_event_loop()
loop.run_until_complete(go())
