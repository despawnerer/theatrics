import os


def unprefix(s, prefix):
    return s[len(prefix):] if s.startswith(prefix) else s


ELASTICSEARCH_ENDPOINTS = [
    unprefix(
        os.environ.get('ELASTICSEARCH_URL', 'elasticsearch:9200'),
        'http://'
    )
]
ELASTICSEARCH_INDEX = os.environ.get('ELASTICSEARCH_INDEX', 'theatrics')
