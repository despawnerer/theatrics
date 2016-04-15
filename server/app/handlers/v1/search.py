from marshmallow import fields

from ..helpers import list_handler, ListParams

from .score import get_default_score_functions


__all__ = ['search']


class SearchParams(ListParams):
    q = fields.String(required=True)
    location = fields.String()


@list_handler(SearchParams)
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
