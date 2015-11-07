import os
import aiohttp
import ujson
from aiohttp import web

from .consts import KUDAGO_API_BASE_URL, CLIENT_DIR


async def serve_api(request):
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


async def serve_client(request):
    filepath = os.path.join(CLIENT_DIR, 'index.html')
    stat = os.stat(filepath)
    chunk_size = 256 * 1024

    response = web.StreamResponse()
    response.content_type = 'text/html'
    response.last_modified = stat.st_mtime
    response.content_length = stat.st_size

    response.start(request)
    with open(filepath, 'rb') as f:
        chunk = f.read(chunk_size)
        while chunk:
            response.write(chunk)
            chunk = f.read(chunk_size)

    return response
