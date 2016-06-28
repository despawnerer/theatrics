from operator import itemgetter
from funcy import flatten, some
from datetime import datetime, time, timedelta

from .utils import (
    maybe_parse_date,
    maybe_parse_time,
    find_first,
    strip_links,
    find_numbers,
    is_from_string,
    is_up_to_string,
)


# main objects

def transform_event(kudago_event, parent_id, children_count):
    tags = kudago_event['tags']
    categories = kudago_event['categories']
    place = kudago_event['place']

    kind = find_first(('festival', 'exhibition', 'theater'), categories)
    dates = filter(is_date_finite, kudago_event['dates'])
    if kind not in ('festival', 'exhibition'):
        dates = flatten(map(split_date, dates))
    dates = list(sorted(map(transform_date, dates), key=itemgetter('start')))

    return {
        '_id': kudago_event['id'],
        '_type': 'event',

        'kind': kind,
        'is_for_kids': 'kids' in categories,
        'is_premiere': 'премьера' in tags,

        'name': kudago_event['short_title'],
        'full_name': kudago_event['title'],
        'tagline': kudago_event['tagline'],
        'lead': strip_links(kudago_event['description']),
        'description': strip_links(kudago_event['body_text']),

        'location': kudago_event['location']['slug'],
        'place': place['id'] if place else None,
        'parent': parent_id,

        'age_restriction': kudago_event['age_restriction'],
        'price': transform_price(kudago_event['price'], kudago_event['is_free']),

        'dates_count': len(dates),
        'children_count': children_count,
        'favorites_count': kudago_event['favorites_count'],
        'comments_count': kudago_event['comments_count'],

        'start': dates[0]['start'] if dates else None,
        'end': dates[-1]['end'] if dates else None,

        'images': kudago_event['images'],
        'dates': dates,

        'source': {
            'name': 'kudago.com',
            'url': kudago_event['site_url'],
        }
    }


def transform_place(kudago_place, events_count):
    categories = kudago_place['categories']

    kind = find_first(('park', 'cafe', 'museums', 'theatre'), categories)
    if kind == 'theatre':
        kind = 'theater'
    elif kind == 'museums':
        kind = 'museum'

    return {
        '_id': kudago_place['id'],
        '_type': 'place',

        'kind': kind,
        'is_for_kids': 'kids' in categories,
        'is_stub': kudago_place['is_stub'],

        'name': kudago_place['short_title'],
        'full_name': kudago_place['title'],
        'lead': strip_links(kudago_place['description']),
        'description': strip_links(kudago_place['body_text']),

        'location': kudago_place['location'],
        'address': kudago_place['address'],
        'subway': kudago_place['subway'],
        'coords': transform_coords(kudago_place['coords']),

        'age_restriction': kudago_place['age_restriction'],
        'phone_numbers': transform_phone(kudago_place['phone']),
        'working_hours': kudago_place['timetable'],
        'url': kudago_place['foreign_url'],

        'events_count': events_count,
        'favorites_count': kudago_place['favorites_count'],
        'comments_count': kudago_place['comments_count'],

        'images': kudago_place['images'],

        'source': {
            'name': 'kudago.com',
            'url': kudago_place['site_url'],
        }
    }


def transform_stub_place(kudago_place):
    return {
        '_id': kudago_place['id'],
        '_type': 'place',

        'is_stub': kudago_place['is_stub'],

        'full_name': kudago_place['title'],

        'location': kudago_place['location'],
        'address': kudago_place['address'],
        'subway': kudago_place['subway'],
        'coords': transform_coords(kudago_place['coords']),

        'phone_numbers': transform_phone(kudago_place['phone']),

        'source': {
            'name': 'kudago.com',
            'url': kudago_place['site_url'],
        }
    }


# related objects

def transform_price(price_text, is_free):
    if is_free:
        lower = 0
        upper = 0
    else:
        numbers = find_numbers(price_text)
        if numbers:
            if is_from_string(price_text):
                lower = numbers[0]
                upper = None
            elif is_up_to_string(price_text):
                lower = None
                upper = numbers[0]
            else:
                lower = min(numbers)
                upper = max(numbers)
        else:
            lower = None
            upper = None

    return {
        'text': price_text,
        'lower': lower,
        'upper': upper,
    }


def transform_phone(phone_text):
    return list(filter(bool, map(str.strip, phone_text.split(','))))


def transform_coords(coords):
    if coords is None:
        return None

    lat, lon = coords.get('lat'), coords.get('lon')
    if not lat or not lon:
        return None

    return {
        'lat': float(lat),
        'lon': float(lon),
    }


def transform_date(spec):
    start_date = maybe_parse_date(spec['start_date'])
    start_time = maybe_parse_time(spec['start_time']) or time(0, 0)
    end_date = maybe_parse_date(spec['end_date']) or start_date
    end_time = maybe_parse_time(spec['end_time']) or start_time

    is_continuous = spec['is_continuous']
    is_date_based = spec['start_time'] is None

    if is_continuous:
        start = datetime.combine(start_date, start_time)
        end = datetime.combine(end_date, end_time)
    else:
        overflows_into_next_day = (
            spec['end_time'] and
            spec['start_time'] and
            spec['end_time'] <= spec['start_time']
        )
        start = datetime.combine(start_date, start_time)
        end = datetime.combine(end_date, end_time)
        if overflows_into_next_day:
            end += timedelta(days=1)

    if is_date_based:
        return {
            'start': start.date().isoformat(),
            'end': end.date().isoformat(),
        }
    else:
        return {
            'start': start.isoformat(),
            'end': end.isoformat(),
        }


def split_date(spec):
    if spec['is_continuous'] or not spec['end_date']:
        yield spec
        return

    start_date = maybe_parse_date(spec['start_date'])
    end_date = maybe_parse_date(spec['end_date']) or start_date

    days = int((end_date - start_date).total_seconds() / (60 * 60 * 24))
    schedules = spec['schedules'] or [{
        'days_of_week': [0, 1, 2, 3, 4, 5, 6],
        'start_time': spec['start_time'],
        'end_time': spec['end_time'],
    }]

    for day in range(days + 1):
        this_date = start_date + timedelta(days=day)
        schedule = some(
            lambda s: this_date.isoweekday() in s['days_of_week'],
            schedules
        )
        if schedule:
            date_string = datetime.combine(this_date, time(0, 0)).isoformat()
            yield {
                'is_continuous': False,
                'start_date': date_string,
                'end_date': date_string,
                'start_time': schedule['start_time'],
                'end_time': schedule['end_time'],
            }


def is_date_finite(spec):
    return spec['start_date'] and not spec['is_endless'] and not spec['is_startless']
