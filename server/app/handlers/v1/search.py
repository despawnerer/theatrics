from marshmallow import Schema, fields

from ..helpers import list_handler, with_params

from .score import get_default_score_functions
from .events import EXPANDABLE_RELATIONS


__all__ = ['search']


class SearchParams(Schema):
    q = fields.String(required=True)
    location = fields.String()


@list_handler(relations=EXPANDABLE_RELATIONS)
@with_params(SearchParams)
async def search(request, q, location=None):
    filters = []

    if location:
        filters.append({'term': {'location': location}})

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
