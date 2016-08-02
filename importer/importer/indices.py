import elasticsearch
import os.path
from datetime import datetime

from .utils.files import read_json_file
from .settings import ELASTICSEARCH_ALIAS


def create_new_index(elastic):
    print("Creating new index...")

    module_path = os.path.dirname(__file__)
    config_filename = os.path.join(module_path, 'configuration', 'index.json')
    index_configuration = read_json_file(config_filename)
    index_name = generate_index_name()
    elastic.indices.create(index_name, index_configuration)
    return index_name


def switch_alias_to_index(elastic, alias_name, index_name):
    print("Switching alias '%s' to index '%s'..." % (alias_name, index_name))

    try:
        existing_aliases = elastic.indices.get_alias(name=alias_name)
    except elasticsearch.NotFoundError:
        existing_aliases = []

    actions = []
    for existing_index_name in existing_aliases:
        actions.append({
            'remove': {
                'index': existing_index_name,
                'alias': alias_name,
            }
        })
    actions.append({
        'add': {
            'index': index_name,
            'alias': alias_name
        }
    })

    elastic.indices.update_aliases({'actions': actions})


def generate_index_name():
    return '{}-{}'.format(ELASTICSEARCH_ALIAS, int(datetime.now().timestamp()))
