from collections import defaultdict
from elasticsearch.helpers import streaming_bulk

from .transform import (
    transform_event,
    transform_place,
    transform_stub_place,
    transform_agent,
    transform_stub_agent,
)
from .fetch import (
    iter_event_children_stubs,
    iter_theatrical_event_stubs,
    iter_theatrical_place_stubs,
    iter_full_events_by_ids,
    iter_full_places_by_ids,
    iter_full_agents_by_ids,
)
from .utils.logging import print_progress


def import_data(kudago, elastic, index_name, since=None):
    importer = Importer(kudago, elastic, index_name, since)
    return importer.go()


class Importer:
    def __init__(self, kudago, elastic, index_name, since):
        self.kudago = kudago
        self.elastic = elastic
        self.index_name = index_name
        self.since = since

        self.event_ids = set()
        self.place_ids = set()
        self.agent_ids = set()
        self.stub_places = {}
        self.stub_agents = {}

        self.event_counts_by_place_id = defaultdict(int)
        self.event_children_counts_by_parent_id = defaultdict(int)
        self.event_parents_by_child_id = {}

    def go(self):
        self.collect_places()
        self.collect_events()

        self.import_stub_places()
        self.import_stub_agents()
        self.import_places()
        self.import_agents()
        self.import_events()

    # collecting

    def collect_events(self):
        print("Collecting theatrical events...")

        events_iter = iter_theatrical_event_stubs(self.kudago, self.since)
        for event in print_progress(events_iter, "Collected %d events"):
            id_ = event['id']
            categories = event['categories'] or []
            place = event['place']
            participants = event['participants']

            self.event_ids.add(id_)

            if place:
                place_id = place['id']
                self.event_counts_by_place_id[place_id] += 1
                if place['is_stub']:
                    self.stub_places[place_id] = place
                else:
                    self.place_ids.add(place_id)

            if participants:
                for participation in participants:
                    agent = participation['agent']
                    agent_id = agent['id']
                    if agent['is_stub']:
                        self.stub_agents[agent_id] = agent
                    else:
                        self.agent_ids.add(agent_id)

            if 'festival' in categories:
                self.collect_event_children(id_)

    def collect_places(self):
        print("Collecting theatrical places...")

        places_iter = iter_theatrical_place_stubs(self.kudago)
        for place in print_progress(places_iter, "Collected %d places"):
            self.place_ids.add(place['id'])

    def collect_event_children(self, parent_id):
        print("Collecting children of event #%d" % parent_id)

        events_iter = iter_event_children_stubs(self.kudago, parent_id)
        for event in events_iter:
            id_ = event['id']
            self.event_parents_by_child_id[id_] = parent_id
            self.event_children_counts_by_parent_id[parent_id] += 1

    # importing

    def import_stub_places(self):
        print("Importing %d stub places..." % len(self.stub_places))

        self.index_all(map(transform_stub_place, self.stub_places.values()))

    def import_stub_agents(self):
        print("Importing %d stub agents..." % len(self.stub_agents))

        self.index_all(map(transform_stub_agent, self.stub_agents.values()))

    def import_places(self):
        print("Importing places...")

        places = iter_full_places_by_ids(self.kudago, self.place_ids)
        docs = map(self.transform_place, places)
        self.index_all(print_progress(docs, "Imported %d places"))

    def import_agents(self):
        print("Importing agents...")

        agents = iter_full_agents_by_ids(self.kudago, self.agent_ids)
        docs = map(transform_agent, agents)
        self.index_all(print_progress(docs, "Imported %d agents"))

    def import_events(self):
        print("Importing events...")

        events = iter_full_events_by_ids(self.kudago, self.event_ids)
        docs = map(self.transform_event, events)
        self.index_all(print_progress(docs, "Imported %d events"))

    def index_all(self, docs):
        actions = map(self.make_index_action, docs)
        bulk_results = streaming_bulk(
            self.elastic,
            actions,
            raise_on_error=False,
            raise_on_exception=False,
        )
        for is_successful, response in bulk_results:
            if not is_successful:
                print("Error indexing a document: %s" % str(response))

    def make_index_action(self, doc):
        type_ = doc.pop('_type')
        id_ = doc.pop('_id')
        return {
            '_index': self.index_name,
            '_type': type_,
            '_id': id_,
            '_source': doc,
        }

    # transformation helpers

    def transform_place(self, item):
        id_ = item['id']
        events_count = self.event_counts_by_place_id[id_]
        return transform_place(item, events_count)

    def transform_event(self, item):
        id_ = item['id']
        children_count = self.event_children_counts_by_parent_id[id_]
        parent_id = self.event_parents_by_child_id.get(id_)
        return transform_event(item, parent_id, children_count)
