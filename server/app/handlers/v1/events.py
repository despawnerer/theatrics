from marshmallow import fields

from ..helpers import item_handler, list_handler, ListParams

from .score import get_default_score_functions


__all__ = ['event', 'event_list']


class EventListParams(ListParams):
    date = fields.Date()
    parent = fields.Integer()
    place = fields.Integer()
    location = fields.String()


@item_handler('event')
async def event(request):
    return request.match_info['id']


@list_handler(EventListParams, 'event')
async def event_list(request, location=None, place=None, parent=None, date=None):
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

    return {
        'function_score': {
            'query': {'bool': {
                'filter': filters,
                'should': [
                    {'term': {'is_for_kids': False}},
                ]
            }},
            'functions': get_default_score_functions()
        }
    }
