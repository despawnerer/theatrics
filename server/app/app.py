import os
from aiohttp import web

from .handlers import debug, legacy
from .consts import CLIENT_DIR
from .settings import DEBUG


app = web.Application()
app.router.add_route('GET', '/api/{path:.+}/', legacy.api_passthrough)

if DEBUG:
    app.router.add_static('/static/', os.path.join(CLIENT_DIR, 'static'))
    app.router.add_route('GET', '/', debug.client)
    app.router.add_route('GET', '/{path:.+}/', debug.client)
