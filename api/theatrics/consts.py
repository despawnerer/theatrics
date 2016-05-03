import os
from datetime import timedelta

PACKAGE_DIR = os.path.dirname(os.path.realpath(__file__))

API_DIR = os.path.dirname(PACKAGE_DIR)
WEB_BUILD_DIR = os.path.join(os.path.dirname(API_DIR), 'web', 'build')

KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/v1'

RESPONSE_CACHE_INTERVAL = timedelta(minutes=15)
RESPONSE_CACHE_SECONDS = int(RESPONSE_CACHE_INTERVAL.total_seconds())
