import re
from datetime import datetime

from marshmallow import Schema, fields

from theatrics.scoring import get_default_score_functions
from theatrics.utils.handlers import with_params, json_response
from theatrics.utils.collections import get_all

from ..helpers import get_list

from .events import EXPANDABLE_RELATIONS


__all__ = ['search']


BROKEN_UP_EM_REGEX = re.compile(r'<\/em>([ \-"“”«»\.,;:–—]*)<em>')
EM_CONTENT_REGEX = re.compile(r'<em>(.*?)<\/em>')


class SearchParams(Schema):
    q = fields.String(required=True)
    location = fields.String()
    include_past = fields.Boolean()


@json_response
async def search(request):
    results = await get_list(
        request,
        query=build_query_from_request(request),
        relations=EXPANDABLE_RELATIONS,
    )
    for item in results['items']:
        highlight = item.get('highlight')
        if highlight:
            item['highlight'] = cleanup_highlight(highlight)
    return results


@with_params(SearchParams)
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
                            'slop': 50
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
        'highlight': {
            'fields': {
                'name.ngram': {},
                'name.text': {},
                'full_name.text': {},
                'full_name.ngram': {},
            }
        }
    }


def cleanup_highlight(highlight):
    name_matches = get_all(highlight, ('name.ngram', 'name.text'))
    full_name_matches = get_all(highlight, ('full_name.text', 'full_name.ngram'))

    new_highlight = {}
    if name_matches:
        new_highlight['name'] = combine_broken_up_ems(max(name_matches, key=count_highlighted_chars))
    if full_name_matches:
        new_highlight['full_name'] = combine_broken_up_ems(max(full_name_matches, key=count_highlighted_chars))
    return new_highlight


def count_highlighted_chars(string):
    return sum(len(match.group(1)) for match in EM_CONTENT_REGEX.finditer(string))


def combine_broken_up_ems(string):
    return BROKEN_UP_EM_REGEX.sub('\\1', string)
