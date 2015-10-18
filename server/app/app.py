from aiohttp import web

from .handlers import serve_api, serve_client
from .settings import CLIENT_DIR, DEBUG


app = web.Application()
app.router.add_route('GET', '/api/{path:.+}/', serve_api)

if DEBUG:
    app.router.add_static('/static/', CLIENT_DIR)
    app.router.add_route('GET', '/', serve_client)
    app.router.add_route('GET', '/{path:.+}/', serve_client)
