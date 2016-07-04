from marshmallow import Schema, fields

from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import with_params

from ..helpers import item_handler, list_handler


__all__ = ['place', 'place_list']


class PlaceListParams(Schema):
    location = fields.String()


@item_handler('place')
async def place(request):
    return request.match_info['id']


@list_handler('place')
@with_params(PlaceListParams)
async def place_list(request, location=None):
    filters = [
        {'term': {'is_stub': False}}
    ]

    if location:
        filters.append({'term': {'location': location}})

    return {
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
