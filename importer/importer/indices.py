import aioes
import os.path
from datetime import datetime

from .utils import read_json_file
from .settings import ELASTICSEARCH_ALIAS


async def create_new_index(elastic):
    module_path = os.path.dirname(__file__)
    config_filename = os.path.join(module_path, 'configuration', 'index.json')
    index_configuration = read_json_file(config_filename)
    index_name = generate_index_name()
    await elastic.indices.create(index_name, index_configuration)
    return index_name


async def switch_alias_to_index(elastic, alias_name, index_name):
    try:
        existing_aliases = await elastic.indices.get_alias(name=alias_name)
    except aioes.NotFoundError:
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

    await elastic.indices.update_aliases({'actions': actions})


def generate_index_name():
    return '{}-{}'.format(ELASTICSEARCH_ALIAS, int(datetime.now().timestamp()))


class IndexPaginator:
    def __init__(self, elastic, index_name, scroll_time='1m', size=100):
        self.elastic = elastic
        self.index_name = index_name
        self.scroll_time = scroll_time
        self.size = size
        self.last_page = None
        self.scroll_id = None

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if self.scroll_id is None:
            response = await self.elastic.search(
                self.index_name,
                scroll=self.scroll_time,
                size=self.size,
            )
        elif len(self.last_page) == self.size:
            response = await self.elastic.scroll(
                self.scroll_id,
                scroll=self.scroll_time,
            )
        else:
            raise StopAsyncIteration

        self.scroll_id = response['_scroll_id']
        self.last_page = response['hits']['hits']
        if self.last_page:
            return self.last_page
        else:
            raise StopAsyncIteration
