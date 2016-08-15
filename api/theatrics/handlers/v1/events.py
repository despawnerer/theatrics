from datetime import datetime

from marshmallow import Schema, fields

from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import with_params, json_response

from ..helpers import get_item, get_list


__all__ = ['event', 'event_list']


EXPANDABLE_RELATIONS = {
    'place': ('place', (
        'location', 'name', 'full_name', 'tagline', 'kind', 'is_for_kids',
        'is_stub', 'url', 'address', 'subway', 'coords', 'working_hours',
        'phone_numbers', 'age_restriction',
    )),
    'parent': ('event', (
        'location', 'name', 'full_name', 'tagline', 'kind', 'is_for_kids',
        'is_premiere', 'tagline', 'age_restriction',
    )),
    'participants.agent': ('agent', (
        'name', 'kind', 'is_stub',
    ))
}


class EventListParams(Schema):
    date = fields.Date()
    parent = fields.Integer()
    place = fields.Integer()
    location = fields.String()
    include_past = fields.Boolean()


@json_response
async def event(request):
    return await get_item(
        request,
        type_='event',
        id_=request.match_info['id'],
        relations=EXPANDABLE_RELATIONS,
    )


@json_response
async def event_list(request):
    return await get_list(
        request,
        query=build_query_from_request(request),
        type_='event',
        relations=EXPANDABLE_RELATIONS,
    )


@with_params(EventListParams)
def build_query_from_request(request, location=None, place=None, parent=None,
                             date=None, include_past=False):
    filters = []

    if location:
        filters.append({'term': {'location': location}})

    if place:
        filters.append({'term': {'place': place}})

    if parent:
        filters.append({'term': {'parent': parent}})

    if date:
        date_value = '{}||/d'.format(date.isoformat())
        filters.append({'nested': {
            'path': 'dates',
            'query': {
                'bool': {
                    'filter': [
                        {'range': {'dates.start': {'lte': date_value}}},
                        {'range': {'dates.end': {'gte': date_value}}}
                    ]
                }
            }
        }})
    elif not include_past:
        now = datetime.now().isoformat()
        filters.append({'range': {'end': {'gte': now}}})

    return {
        'query': {
            'function_score': {
                'query': {'bool': {
                    'filter': filters,
                    'should': [
                        {'term': {'kind': 'theater'}},
                        {'term': {'is_for_kids': False}},
                    ]
                }},
                'functions': get_default_score_functions()
            }
        }
    }
