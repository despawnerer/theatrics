import asyncio
from funcy import flatten
from collections import defaultdict

from .transform import (
    transform_event,
    transform_place,
    transform_stub_place,
)
from .fetch import (
    get_child_event_pages,
    get_theatrical_event_pages,
    get_theatrical_place_pages,
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

        self.event_ids = set()
        self.place_ids = set()
        self.stub_place_ids = set()
        self.stub_places = []

        self.event_counts_by_place_id = defaultdict(int)
        self.event_children_counts_by_parent_id = defaultdict(int)
        self.event_parents_by_child_id = {}

    async def go(self):
        await asyncio.wait([
            self.fetch_events(),
            self.fetch_places(),
        ])

        await asyncio.wait([
            self.import_places(),
            self.import_stub_places(),
        ])

        await self.import_events()

    # fetching

    async def fetch_events(self):
        print("Fetching theatrical events...")
        pages_iter = get_theatrical_event_pages(self.kudago, self.since)
        subtasks = []
        async for page in print_fetch_progress(pages_iter, 'events'):
            for event in page:
                id_ = event['id']
                categories = event['categories'] or []
                place = event['place']

                self.event_ids.add(id_)

                if place:
                    place_id = place['id']
                    self.event_counts_by_place_id[place_id] += 1
                    if place['is_stub']:
                        if place_id not in self.stub_place_ids:
                            self.stub_places.append(place)
                    else:
                        self.place_ids.add(place_id)

                if 'festival' in categories:
                    subtasks.append(
                        asyncio.ensure_future(
                            self.fetch_event_children(id_)
                        )
                    )
        await asyncio.wait(subtasks)

    async def fetch_places(self):
        print("Fetching theatrical places...")
        pages_iter = get_theatrical_place_pages(self.kudago)
        async for page in print_fetch_progress(pages_iter, 'places'):
            for place in page:
                self.place_ids.add(place['id'])

    async def fetch_event_children(self, parent_id):
        print("Fetching children of event #%d" % parent_id)
        pages_iter = get_child_event_pages(self.kudago, parent_id)
        async for page in pages_iter:
            for event in page:
                id_ = event['id']
                self.event_parents_by_child_id[id_] = parent_id
                self.event_children_counts_by_parent_id[parent_id] += 1

    # importing

    async def import_places(self):
        print("Importing places...")
        return await self.import_pages(
            print_fetch_progress(
                get_place_pages(self.kudago, self.place_ids),
                'places',
            ),
            self.transform_place,
            'place',
        )

    async def import_stub_places(self):
        print("Importing %d stub places..." % len(self.stub_places))
        await self.import_list(
            self.stub_places,
            self.transform_stub_place,
            'place',
        )

    async def import_events(self):
        print("Importing events...")
        await self.import_pages(
            print_fetch_progress(
                get_event_pages(self.kudago, self.event_ids),
                'events',
            ),
            self.transform_event,
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

    # transforming helpers

    def transform_place(self, item):
        id_ = item['id']
        events_count = self.event_counts_by_place_id[id_]
        return transform_place(item, events_count)

    def transform_stub_place(self, item):
        return transform_stub_place(item)

    def transform_event(self, item):
        id_ = item['id']
        children_count = self.event_children_counts_by_parent_id[id_]
        parent_id = self.event_parents_by_child_id.get(id_)
        return transform_event(item, parent_id, children_count)
