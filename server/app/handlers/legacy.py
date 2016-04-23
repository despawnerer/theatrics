import aiohttp
import json
import time
from datetime import datetime
from aiohttp import web, hdrs

from ..consts import (
    KUDAGO_API_BASE_URL,
    RESPONSE_CACHE_INTERVAL,
    RESPONSE_CACHE_SECONDS,
)


__all__ = ['api_passthrough']


async def api_passthrough(request):
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
