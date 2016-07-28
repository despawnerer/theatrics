from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import json_response

from ..helpers import get_item, get_list


__all__ = ['agent', 'agent_list']


@json_response
async def agent(request):
    return await get_item(
        request,
        type_='agent',
        id_=request.match_info['id'],
    )


@json_response
async def agent_list(request):
    return await get_list(
        request,
        type_='agent',
        query=build_query_from_request(request),
    )


def build_query_from_request(request):
    return {
        'query': {
            'function_score': {
                'query': {'bool': {
                    'filter': {'term': {'is_stub': False}},
                }},
                'functions': get_default_score_functions()
            }
        }
    }
