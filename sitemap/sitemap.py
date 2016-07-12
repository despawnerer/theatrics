from bottle import route, run, response
from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan


ELASTICSEARCH_ENDPOINTS = ['elasticsearch:9200']
ELASTICSEARCH_INDEX = 'theatrics'


elastic = Elasticsearch(ELASTICSEARCH_ENDPOINTS)

query = {
    'query': {
        'bool': {
            'should': [
                {'term': {'is_stub': False}},
                {'missing': {'field': 'is_stub'}},
            ]
        }
    },
    'fields': []
}

locations = (
    'ekb', 'kev', 'krasnoyarsk', 'kzn', 'msk', 'nnv', 'nsk', 'sochi', 'spb'
)


@route('/sitemap.txt')
def sitemap():
    response.content_type = 'text/plain'

    for location in locations:
        yield 'http://theatrics.ru/{}/\n'.format(location)
        yield 'http://theatrics.ru/{}/events/\n'.format(location)
        yield 'http://theatrics.ru/{}/places/\n'.format(location)

    for doc in scan(elastic, query=query, index=ELASTICSEARCH_INDEX):
        type_ = doc['_type']
        id_ = doc['_id']
        yield 'http://theatrics.ru/{}/{}/\n'.format(type_, id_)
