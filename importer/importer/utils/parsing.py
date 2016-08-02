from isodate import parse_date, parse_time

from .decorators import maybe


__all__ = ['maybe_parse_date', 'maybe_parse_time']


maybe_parse_date = maybe(parse_date)
maybe_parse_time = maybe(parse_time)
