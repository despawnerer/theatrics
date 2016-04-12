import asyncio
from funcy import flatten

from .transform import (
    transform_event,
    transform_place,
    transform_stub_place,
)
from .fetch import (
    fetch_theatrical_events,
    fetch_theatrical_places,
    get_event_pages,
    get_place_pages,
)
from .utils import print_fetch_progress


async def import_data(kudago, elastic, index_name, since=None):
    importer = Importer(kudago, elastic, index_name, since)
    return await importer.go()


class Importer:
    def __init__(self, kudago, elastic, index_name, since):
        self.kudago = kudago
        self.elastic = elastic
        self.index_name = index_name
        self.since = since

    async def go(self):
        events, places = await asyncio.gather(
            fetch_theatrical_events(self.kudago, self.since),
            fetch_theatrical_places(self.kudago),
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
            self.import_places(place_ids),
            self.import_stub_places(stub_places),
        )

        await self.import_events(event_ids)

        print("Done.")

    async def import_places(self, place_ids):
        print("Importing places...")
        return await self.import_pages(
            print_fetch_progress(
                get_place_pages(self.kudago, place_ids),
                'places',
            ),
            transform_place,
            'place',
        )

    async def import_stub_places(self, stub_places):
        print("Importing %d stub places..." % len(stub_places))
        return await self.import_list(
            stub_places,
            transform_stub_place,
            'place',
        )

    async def import_events(self, event_ids):
        print("Importing events...")
        return await self.import_pages(
            print_fetch_progress(
                get_event_pages(self.kudago, event_ids),
                'events',
            ),
            transform_event,
            'event',
        )

    async def import_pages(self, pages, transform, doc_type):
        futures = []
        async for page in pages:
            coro = self.import_list(page, transform, doc_type)
            futures.append(asyncio.ensure_future(coro))
        return flatten(await asyncio.gather(*futures))

    async def import_list(self, data_list, transform, doc_type):
        actions = []
        doc_id_list = []
        for doc in map(transform, data_list):
            doc_id = doc.pop('id')
            actions.append({'index': {'_id': doc_id}})
            actions.append(doc)
            doc_id_list.append(doc_id)
        await self.elastic.bulk(actions, self.index_name, doc_type)
        return doc_id_list
