from elasticsearch import Elasticsearch

from .utils import wait_for_all_services
from .settings import ELASTICSEARCH_ENDPOINTS


def connect_to_elasticsearch():
    print("Connecting to Elasticsearch...")
    wait_for_all_services(ELASTICSEARCH_ENDPOINTS, timeout=10)
    return Elasticsearch(ELASTICSEARCH_ENDPOINTS)
