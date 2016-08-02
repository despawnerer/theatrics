import os


ELASTICSEARCH_ENDPOINTS = [os.environ.get('ELASTICSEARCH_URL', 'elasticsearch:9200')]
ELASTICSEARCH_INDEX = os.environ.get('ELASTICSEARCH_INDEX', 'theatrics')
