import os

DEBUG = True

PROJECT_DIR = os.path.dirname(os.path.realpath(__file__))
CLIENT_DIR = os.path.join(os.path.dirname(PROJECT_DIR), 'client/build')

KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/v1'
