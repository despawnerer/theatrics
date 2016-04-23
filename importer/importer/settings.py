import os


def unprefix(s, prefix):
    return s[len(prefix):] if s.startswith(prefix) else s


ELASTICSEARCH_ENDPOINTS = [
    unprefix(
        os.environ.get('ELASTICSEARCH_URL', 'localhost:9200'),
        'http://'
    )
]
ELASTICSEARCH_ALIAS = os.environ.get('ELASTICSEARCH_INDEX', 'theatrics')
