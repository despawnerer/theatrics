from aiohttp import web

from .handlers import handle_api
from .settings import CLIENT_DIR, DEBUG


app = web.Application()
app.router.add_route('GET', '/api/{path:.+}/', handle_api)

if DEBUG:
    app.router.add_static('/', CLIENT_DIR)
