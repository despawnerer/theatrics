import os
from aiohttp import web

from ..consts import CLIENT_DIR


__all__ = ['client']


async def client(request):
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
