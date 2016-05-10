from aioes import Elasticsearch

from .settings import ELASTICSEARCH_ENDPOINTS


elastic = Elasticsearch(ELASTICSEARCH_ENDPOINTS)
