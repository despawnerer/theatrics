import os

DEBUG = True

PROJECT_DIR = os.path.dirname(os.path.realpath(__file__))
STATIC_DIR = os.path.join(PROJECT_DIR, 'static')
TEMPLATES_DIR = os.path.join(PROJECT_DIR, 'templates')

KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/v1'
