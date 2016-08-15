from marshmallow import Schema, fields

from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import with_params, json_response

from ..helpers import get_item, get_list


__all__ = ['place', 'place_list']


class PlaceListParams(Schema):
    location = fields.String()


@json_response
async def place(request):
    return await get_item(
        request,
        type_='place',
        id_=request.match_info['id'],
    )


@json_response
async def place_list(request):
    return await get_list(
        request,
        type_='place',
        query=build_query_from_request(request),
    )


@with_params(PlaceListParams)
def build_query_from_request(request, location=None):
    filters = [
        {'term': {'is_stub': False}}
    ]

    if location:
        filters.append({'term': {'location': location}})

    return {
        'query': {
            'function_score': {
                'query': {'bool': {
                    'filter': filters,
                    'should': [
                        {'term': {'kind': 'theater'}},
                        {'term': {'is_for_kids': False}},
                    ],
                }},
                'functions': get_default_score_functions()
            }
        }
    }
