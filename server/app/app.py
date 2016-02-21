import os
from aiohttp import web

from .handlers import serve_api, serve_client
from .consts import CLIENT_DIR
from .settings import DEBUG


app = web.Application()
app.router.add_route('GET', '/api/{path:.+}/', serve_api)

if DEBUG:
    app.router.add_static('/static/', os.path.join(CLIENT_DIR, 'static'))
    app.router.add_route('GET', '/', serve_client)
    app.router.add_route('GET', '/{path:.+}/', serve_client)
