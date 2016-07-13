from datetime import datetime

from marshmallow import Schema, fields

from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import with_sync_params, json_response

from ..helpers import get_list

from .events import EXPANDABLE_RELATIONS


__all__ = ['search']


class SearchParams(Schema):
    q = fields.String(required=True)
    location = fields.String()
    include_past = fields.Boolean()


@json_response
async def search(request):
    return await get_list(
        request,
        query=build_query_from_request(request),
        relations=EXPANDABLE_RELATIONS,
    )


@with_sync_params(SearchParams)
def build_query_from_request(request, q, location=None, include_past=False):
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
        'query': {
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
        },
    }
