import json
import re
import asyncio
from time import time
from isodate import parse_date, parse_time
from functools import wraps


link_expression = re.compile(r'<a .*?href=".*?".*?>(.+?)<\/a>', re.DOTALL)
number_expression = re.compile(r'\b(?:\d+ ?)+\b')
from_expression = re.compile(r'^от\s(?:\d+ ?)+[^\d]*$')
up_to_expression = re.compile(r'до\s(?:\d+ ?)+[^\d]*$')


def run_sync(coro):
    @wraps(coro)
    def wrapper(*args, **kwargs):
        future = coro(*args, **kwargs)
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(future)
    return wrapper


def maybe(f):
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


def print_fetch_progress(iterable, type_hint):
    return AsyncProgressPrinter(
        iterable,
        message="Fetched %%(done)d/%%(total)d %s" % type_hint,
        total=lambda i: i.item_count,
        each=len,
    )


async def wait_for_all_services(endpoint_list, timeout):
    await asyncio.wait([
        wait_for_service(endpoint, timeout)
        for endpoint in endpoint_list
    ])


async def wait_for_service(endpoint, timeout):
    host, port = endpoint.split(':')
    wait_until = time() + timeout

    while True:
        try:
            reader, writer = await asyncio.open_connection(host, port)
        except:
            if time() < wait_until:
                await asyncio.sleep(1)
            else:
                raise
        else:
            return


class AsyncProgressPrinter:
    def __init__(self, iterable, message="%(done)d/%(total)d",
                 total=len, each=lambda item: 1, print=print):
        self.iterable = iterable
        self.message = message
        self.total_getter = total
        self.each_getter = each
        self.total = None
        self.done = 0
        self.print = print

    async def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            value = await self.iterable.__anext__()
        except StopAsyncIteration:
            raise
        else:
            self.total = self.total_getter(self.iterable)
            self.done += self.each_getter(value)
            self.print(self.message % {'total': self.total, 'done': self.done})
            return value
