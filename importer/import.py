import asyncio
import aiohttp
import aioes
from datetime import datetime
from funcy import flatten

from importer.kudago import KudaGo
from importer.transform import (
    transform_event,
    transform_place,
    transform_stub_place,
)
from importer.fetch import (
    get_theater_event_pages,
    get_theater_place_pages,
    get_event_pages,
    get_place_pages,
)
from importer.utils import AsyncProgressPrinter


ELASTIC_ENDPOINTS = ['localhost:9200']
ELASTIC_INDEX = 'theatrics'


async def go():
    with aiohttp.ClientSession() as http_client:
        kudago = KudaGo(http_client)
        elastic = aioes.Elasticsearch(ELASTIC_ENDPOINTS)

        events, places = await asyncio.gather(
            fetch_theatrical_events(kudago),
            fetch_theatrical_places(kudago),
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

        await asyncio.gather(
            import_places(elastic, kudago, place_ids),
            import_stub_places(elastic, stub_places),
        )

        await import_events(elastic, kudago, event_ids)

        print("Done")


async def fetch_theatrical_events(kudago):
    print("Fetching theatrical events...")
    return await flatten_pages(
        print_fetch_progress(
            get_theater_event_pages(kudago, since=datetime.now()),
            'events'
        )
    )


async def fetch_theatrical_places(kudago):
    print("Fetching theatrical places...")
    return await flatten_pages(
        print_fetch_progress(
            get_theater_place_pages(kudago),
            'places'
        )
    )


async def import_places(elastic, kudago, place_ids):
    print("Importing places...")
    return await import_pages(
        elastic,
        print_fetch_progress(get_place_pages(kudago, place_ids), 'places'),
        transform_place,
        'place',
    )


async def import_stub_places(elastic, stub_places):
    print("Importing %d stub places..." % len(stub_places))
    return await import_list(
        elastic,
        stub_places,
        transform_stub_place,
        'place',
    )


async def import_events(elastic, kudago, event_ids):
    print("Importing events...")
    return await import_pages(
        elastic,
        print_fetch_progress(get_event_pages(kudago, event_ids), 'events'),
        transform_event,
        'event',
    )


# generic importing functions

async def flatten_pages(pages):
    result = []
    async for page in pages:
        result += page
    return result


async def import_pages(elastic, pages, transform, doc_type):
    futures = []
    async for page in pages:
        coro = import_list(elastic, page, transform, doc_type)
        futures.append(asyncio.ensure_future(coro))
    return flatten(await asyncio.gather(*futures))


async def import_list(elastic, data_list, transform, doc_type):
    return await asyncio.gather(*[
        import_item(elastic, item, transform, doc_type)
        for item in data_list
    ])


async def import_item(elastic, item, transform, doc_type):
    doc = transform(item)
    doc_id = doc.pop('id')
    result = await elastic.index(ELASTIC_INDEX, doc_type, doc, id=doc_id)
    return doc_id


# logging utilities

def print_fetch_progress(iterable, type_hint):
    return AsyncProgressPrinter(
        iterable,
        message="Fetched %%(done)d/%%(total)d %s" % type_hint,
        total=lambda i: i.item_count,
        each=len,
    )


loop = asyncio.get_event_loop()
loop.run_until_complete(go())
