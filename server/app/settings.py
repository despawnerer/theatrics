import os


def unprefix(s, prefix):
    return s[len(prefix):] if s.startswith(prefix) else s


DEBUG = bool(os.environ.get('THEATRICS_DEBUG'))

ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL', 'http://localhost:9200')
ELASTICSEARCH_ENDPOINTS = [unprefix(ELASTICSEARCH_URL, 'http://')]
