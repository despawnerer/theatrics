from aioes import Elasticsearch

from .settings import ELASTICSEARCH_URL


elastic = Elasticsearch([ELASTICSEARCH_URL])
