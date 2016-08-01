from aiohttp import web

from .handlers import v1


app = web.Application()

app.router.add_route('GET', '/v1/events/', v1.event_list)
app.router.add_route('GET', '/v1/events/{id:\d+}/', v1.event)
app.router.add_route('GET', '/v1/places/', v1.place_list)
app.router.add_route('GET', '/v1/places/{id:\d+}/', v1.place)
app.router.add_route('GET', '/v1/agents/', v1.agent_list)
app.router.add_route('GET', '/v1/agents/{id:\d+}/', v1.agent)
app.router.add_route('GET', '/v1/search/', v1.search)
