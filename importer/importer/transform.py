from funcy import flatten, some
from datetime import datetime, time, timedelta

from .utils import (
    find_first,
    date_from_timestamp,
    strip_links,
    time_from_seconds,
)


# main objects

def transform_event(kudago_event):
    tags = kudago_event['tags']
    categories = kudago_event['categories']
    place = kudago_event['place']

    type_ = find_first(('festival', 'exhibition', 'theater'), categories)
    dates = filter(is_date_finite, kudago_event['dates'])

    if type_ not in ('festival', 'exhibition'):
        dates = flatten(map(split_date, dates))

    return {
        'id': kudago_event['id'],
        'type': type_,
        'is_premiere': 'премьера' in tags,

        'name': kudago_event['short_title'],
        'full_name': kudago_event['title'],
        'tagline': kudago_event['tagline'],
        'lead': strip_links(kudago_event['description']),
        'description': strip_links(kudago_event['body_text']),

        'location': kudago_event['location']['slug'],
        'place': place['id'] if place else None,

        'age_restriction': kudago_event['age_restriction'],
        'price': transform_price(kudago_event['price'], kudago_event['is_free']),

        'favorites_count': kudago_event['favorites_count'],
        'comments_count': kudago_event['comments_count'],

        'images': kudago_event['images'],
        'dates': list(map(transform_date, dates)),

        'source': {
            'name': 'KudaGo.com',
            'url': kudago_event['site_url'],
        }
    }


def transform_place(kudago_place):
    return {
        'id': kudago_place['id'],

        'is_closed': kudago_place['is_closed'],
        'is_stub': kudago_place['is_stub'],

        'name': kudago_place['short_title'],
        'full_name': kudago_place['title'],
        'lead': strip_links(kudago_place['description']),
        'description': strip_links(kudago_place['body_text']),

        'location': kudago_place['location'],
        'address': kudago_place['address'],
        'subway': kudago_place['subway'],
        'coords': kudago_place['coords'],

        'age_restriction': kudago_place['age_restriction'],
        'phone_numbers': kudago_place['phone'].split(','),
        'working_hours': kudago_place['timetable'],
        'url': kudago_place['foreign_url'],

        'favorites_count': kudago_place['favorites_count'],
        'comments_count': kudago_place['comments_count'],

        'images': kudago_place['images'],

        'source': {
            'name': 'KudaGo.com',
            'url': kudago_place['site_url'],
        }
    }


def transform_stub_place(kudago_place):
    return {
        'id': kudago_place['id'],

        'is_closed': kudago_place['is_closed'],
        'is_stub': kudago_place['is_stub'],

        'full_name': kudago_place['title'],

        'location': kudago_place['location'],
        'address': kudago_place['address'],
        'subway': kudago_place['subway'],
        'coords': kudago_place['coords'],

        'phone_numbers': kudago_place['phone'].split(','),

        'source': {
            'name': 'KudaGo.com',
            'url': kudago_place['site_url'],
        }
    }


# related objects

def transform_price(price_text, is_free):
    # TODO: extract from/to from the text
    return {
        'text': price_text,
    }


def transform_date(spec):
    start_date = date_from_timestamp(spec['start_date'])
    start_time = time_from_seconds(spec['start_time']) or time(0, 0)
    end_date = date_from_timestamp(spec['end_date']) or start_date
    end_time = time_from_seconds(spec['end_time']) or start_time

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

    start_date = date_from_timestamp(spec['start_date'])
    end_date = date_from_timestamp(spec['end_date']) or start_date

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
            date_ts = datetime.combine(this_date, time(0, 0)).timestamp()
            yield {
                'is_continuous': False,
                'start_date': date_ts,
                'end_date': date_ts,
                'start_time': schedule['start_time'],
                'end_time': schedule['end_time'],
            }


def is_date_finite(spec):
    return spec['start_date'] and not spec['is_endless'] and not spec['is_startless']
