import os
import aiohttp
import json
import time
from datetime import datetime
from aiohttp import web, hdrs

from .consts import (
    CLIENT_DIR,
    KUDAGO_API_BASE_URL,
    RESPONSE_CACHE_INTERVAL,
    RESPONSE_CACHE_SECONDS,
)


async def serve_api(request):
    url = '{}/{}/?{}'.format(
        KUDAGO_API_BASE_URL,
        request.match_info['path'],
        request.query_string,
    )
    response = await aiohttp.get(url)
    body = await response.json()

    if isinstance(body, dict):
        for field in ('next', 'previous'):
            value = body.get(field)
            if value:
                body[field] = value.replace(KUDAGO_API_BASE_URL, '/api')

    expire_dt = datetime.utcnow() + RESPONSE_CACHE_INTERVAL
    return web.Response(
        text=json.dumps(body, ensure_ascii=False),
        content_type='application/json',
        headers={
            hdrs.CACHE_CONTROL: 'public, max-age=%d' % RESPONSE_CACHE_SECONDS,
            hdrs.EXPIRES: expire_dt.strftime('%a, %d %b %Y %H:%M:%S GMT'),
        }
    )


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
