from aiohttp import web

from .handlers import serve_api


app = web.Application()
app.router.add_route('GET', '/{path:.+}/', serve_api)
