import json
from functools import wraps
from aiohttp import web


__all__ = ['with_params']


def with_params(schema_cls):
    schema = schema_cls()

    def decorator(f):
        @wraps(f)
        async def wrapper(request):
            result = schema.load(request.GET)
            if result.errors:
                raise web.HTTPBadRequest(
                    text=json.dumps({
                        'errors': result.errors
                    }, ensure_ascii=False),
                    content_type='application/json',
                )
            else:
                return await f(request, **result.data)
        return wrapper
    return decorator
