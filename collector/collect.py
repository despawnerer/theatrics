import asyncio
import aiohttp
import aioes
from datetime import datetime
from funcy import flatten

from collector.kudago import KudaGo
from collector.transform import (
    transform_event,
    transform_place,
    transform_stub_place,
)
from collector.fetch import (
    fetch_theater_events,
    fetch_theater_places,
    fetch_event_pages,
    fetch_place_pages,
)


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_INDEX = 'theatrics'


async def go():
    with aiohttp.ClientSession() as http_client:
        kudago = KudaGo(http_client)
        elastic = aioes.Elasticsearch(ELASTIC_ENDPOINTS)

        print("Fetching lists of theatrical events and places...")

        events, places = await asyncio.gather(
            flatten_pages(fetch_theater_events(kudago, datetime.now()), 'event'),
            flatten_pages(fetch_theater_places(kudago), 'place'),
        )

        print("Gathering ids to fetch details and separating stub places...")

        event_ids = set()
        place_ids = {place['id'] for place in places}
        stub_place_ids = set()
        stub_places = []
        for event in events:
            event_ids.add(event['id'])
            place = event['place']
            if place and place['is_stub']:
                if place['id'] not in stub_place_ids:
                    stub_places.append(place)
            elif place:
                place_ids.add(place['id'])

        print("Total events to fetch:", len(event_ids))
        print("Total places to fetch:", len(place_ids))
        print("Total stub places:", len(stub_places))

        print("Fetching and indexing places...")

        place_pages = fetch_place_pages(kudago, place_ids)
        await asyncio.gather(
            index_pages(elastic, place_pages, transform_place, 'place'),
            index_list(elastic, stub_places, transform_stub_place, 'place')
        )

        print("Fetching and indexing events...")
        event_pages = fetch_event_pages(kudago, event_ids)
        await index_pages(elastic, event_pages, transform_event, 'event')


async def flatten_pages(pages, type_hint):
    result = []
    have = 0
    async for page in pages:
        have += len(page)
        print("Received %d/%d %ss" % (have, pages.item_count, type_hint))
        result += page
    return result


async def index_pages(elastic, pages, transform, doc_type):
    print("Collecting %ss" % doc_type)
    have = 0
    futures = []
    async for page in pages:
        have += len(page)
        print("Received %d/%d %ss" % (have, pages.item_count, doc_type))
        coro = index_list(elastic, page, transform, doc_type)
        futures.append(asyncio.ensure_future(coro))
    return flatten(await asyncio.gather(*futures))


async def index_list(elastic, data_list, transform, doc_type):
    return await asyncio.gather(*[
        index(elastic, data, transform, doc_type)
        for data in data_list
    ])


async def index(elastic, data, transform, doc_type):
    doc = transform(data)
    doc_id = doc.pop('id')
    result = await elastic.index(ELASTIC_INDEX, doc_type, doc, id=doc_id)
    return doc_id


loop = asyncio.get_event_loop()
loop.run_until_complete(go())
