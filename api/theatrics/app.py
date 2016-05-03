import os
from aiohttp import web

from .handlers import debug, legacy, v1
from .consts import WEB_BUILD_DIR
from .settings import DEBUG


app = web.Application()

app.router.add_route('GET', '/api/v1/events/', v1.event_list)
app.router.add_route('GET', '/api/v1/events/{id:\d+}/', v1.event)
app.router.add_route('GET', '/api/v1/places/', v1.place_list)
app.router.add_route('GET', '/api/v1/places/{id:\d+}/', v1.place)
app.router.add_route('GET', '/api/v1/search/', v1.search)

app.router.add_route('GET', '/api/{path:.+}/', legacy.api_passthrough)

if DEBUG:
    app.router.add_static('/static/', os.path.join(WEB_BUILD_DIR, 'static'))
    app.router.add_route('GET', '/', debug.client)
    app.router.add_route('GET', '/{path:.+}/', debug.client)
