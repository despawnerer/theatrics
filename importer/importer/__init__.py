from elasticsearch.helpers import reindex

from .connections import connect_to_elasticsearch
from .indices import create_new_index, switch_alias_to_index
from .importer import import_data
from .kudago import KudaGo
from .settings import ELASTICSEARCH_ALIAS


def migrate():
    print("Starting migration...")

    elastic = connect_to_elasticsearch()
    index_name = create_new_index(elastic)

    if elastic.indices.exists(ELASTICSEARCH_ALIAS):
        print("Reindexing data from previous index...")
        reindex(elastic, ELASTICSEARCH_ALIAS, index_name)

    switch_alias_to_index(elastic, ELASTICSEARCH_ALIAS, index_name)

    print("Done.")


def update(since):
    print(
        "Updating events since {}...".format(since)
        if since else "Updating all events..."
    )

    elastic = connect_to_elasticsearch()
    kudago = KudaGo()
    import_data(kudago, elastic, ELASTICSEARCH_ALIAS, since=since)

    print("Done.")


def reimport():
    print("Starting reimport")

    elastic = connect_to_elasticsearch()
    kudago = KudaGo()

    index_name = create_new_index(elastic)
    import_data(kudago, elastic, index_name)
    switch_alias_to_index(elastic, ELASTICSEARCH_ALIAS, index_name)

    print("Done.")
