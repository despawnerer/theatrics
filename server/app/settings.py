import os

DEBUG = bool(os.environ.get('THEATRICS_DEBUG'))

ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL', 'localhost:9200')
