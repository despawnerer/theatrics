from datetime import datetime, time


def find_first(needles, haystack):
    for needle in needles:
        if needle in haystack:
            return needle


def date_from_timestamp(timestamp):
    if timestamp:
        return datetime.utcfromtimestamp(timestamp).date()
    else:
        return None


def time_from_seconds(seconds):
    if seconds:
        minutes, second = divmod(seconds, 60)
        hour, minute = divmod(minutes, 60)
        return time(hour, minute, second)
    else:
        return None


def strip_links(text):
    return text  # TODO
