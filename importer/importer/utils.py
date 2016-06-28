import json
import re
import socket
from datetime import datetime
from time import time, sleep
from isodate import parse_date, parse_time
from functools import wraps


link_expression = re.compile(r'<a .*?href=".*?".*?>(.+?)<\/a>', re.DOTALL)
number_expression = re.compile(r'\b(?:\d+ ?)+\b')
from_expression = re.compile(r'^от\s(?:\d+ ?)+[^\d]*$')
up_to_expression = re.compile(r'до\s(?:\d+ ?)+[^\d]*$')


def maybe(f):
    """
    Pass-through if first argument to the function is None.
    """
    @wraps(f)
    def wrapper(arg, *rest, **kwargs):
        return None if arg is None else f(arg, *rest, **kwargs)
    return wrapper


maybe_parse_date = maybe(parse_date)
maybe_parse_time = maybe(parse_time)


def find_first(needles, haystack):
    for needle in needles:
        if needle in haystack:
            return needle


def strip_links(text):
    return link_expression.sub('\\1', text)


def find_numbers(text):
    return [
        int(''.join(filter(str.isdigit, s)))
        for s in number_expression.findall(text)
        if s.strip()
    ]


def is_from_string(text):
    return bool(from_expression.match(text))


def is_up_to_string(text):
    return bool(up_to_expression.match(text))


def read_json_file(filename):
    with open(filename) as f:
        return json.loads(f.read())


def get_today():
    return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)


def print_progress(iterable, message, every=100):
    for count, item in enumerate(iterable, 1):
        yield item
        if count % every == 0:
            print(message % count)
    if count % every != 0:
        print(message % count)


def wait_for_all_services(endpoint_list, timeout):
    for endpoint in endpoint_list:
        wait_for_service(endpoint, timeout)


def wait_for_service(endpoint, timeout):
    host, port = endpoint.split(':')
    wait_until = time() + timeout

    while True:
        try:
            connection = socket.create_connection((host, port))
        except:
            if time() < wait_until:
                sleep(1)
            else:
                raise
        else:
            connection.close()
            return
