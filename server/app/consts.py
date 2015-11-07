import os

THIS_DIR = os.path.dirname(os.path.realpath(__file__))

SERVER_DIR = os.path.dirname(THIS_DIR)
CLIENT_DIR = os.path.join(os.path.dirname(SERVER_DIR), 'client/build')

KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/v1'
