import aiohttp
import ujson
from aiohttp import web

from .settings import DEBUG, KUDAGO_API_BASE_URL


async def handle_api(request):
    url = '{}/{}/?{}'.format(
        KUDAGO_API_BASE_URL,
        request.match_info['path'],
        request.query_string,
    )
    response = await aiohttp.get(url)
    body = await response.json(loads=ujson.loads)

    if isinstance(body, dict):
        for field in ('next', 'previous'):
            value = body.get(field)
            if value:
                body[field] = value.replace(KUDAGO_API_BASE_URL, '/api')

    return web.Response(body=ujson.dumps(body).encode('utf-8'))
