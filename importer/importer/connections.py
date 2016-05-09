import aioes

from .utils import wait_for_all_services
from .settings import ELASTICSEARCH_ENDPOINTS


async def connect_to_elasticsearch():
    print("Connecting to Elasticsearch...")

    await wait_for_all_services(ELASTICSEARCH_ENDPOINTS, timeout=10)
    elastic = aioes.Elasticsearch(ELASTICSEARCH_ENDPOINTS)
    await elastic.cluster.health(wait_for_status='yellow', timeout='5s')
    return elastic
