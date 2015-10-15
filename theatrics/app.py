import jinja2
import aiohttp_jinja2
from aiohttp import web

from .handlers import handle_client, handle_api
from .settings import STATIC_DIR, TEMPLATES_DIR


app = web.Application()
app.router.add_static('/static/', STATIC_DIR)
app.router.add_route('GET', '/api/{path:.+}/', handle_api)
app.router.add_route('GET', '/', handle_client)

aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(TEMPLATES_DIR))
