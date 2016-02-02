from datetime import timedelta

KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/v1'

RESPONSE_CACHE_INTERVAL = timedelta(minutes=15)
RESPONSE_CACHE_SECONDS = int(RESPONSE_CACHE_INTERVAL.total_seconds())
