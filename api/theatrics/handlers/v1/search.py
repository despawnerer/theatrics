from datetime import datetime

from marshmallow import Schema, fields

from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import with_params

from ..helpers import list_handler

from .events import EXPANDABLE_RELATIONS


__all__ = ['search']


class SearchParams(Schema):
    q = fields.String(required=True)
    location = fields.String()
    include_past = fields.Boolean()


@list_handler(relations=EXPANDABLE_RELATIONS)
@with_params(SearchParams)
async def search(request, q, location=None, include_past=False):
    filters = [
        {
            'bool': {
                'should': [
                    {'term': {'is_stub': False}},
                    {'missing': {'field': 'is_stub'}},
                ]
            }
        }
    ]

    if location:
        filters.append({'term': {'location': location}})

    if not include_past:
        now = datetime.now().isoformat()
        filters.append({
            'bool': {
                'should': [
                    {'range': {'end': {'gte': now}}},
                    {'missing': {'field': 'end'}}
                ]
            }
        })

    return {
        'function_score': {
            'query': {'bool': {
                'must': [
                    {'multi_match': {
                        'query': q,
                        'type': 'phrase',
                        'fields': [
                            'name.ngram',
                            'name.text',
                            'full_name.ngram',
                            'full_name.text'
                        ],
                    }},
                ],
                'filter': filters,
                'should': [
                    {'term': {'_type': 'place'}},
                    {'term': {'is_for_kids': False}},
                ],
            }},
            'functions': get_default_score_functions()
        }
    }
