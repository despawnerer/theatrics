import json
import re
from datetime import datetime, time


link_expression = re.compile(r'<a .*?href=".*?".*?>(.+?)<\/a>', re.DOTALL)
number_expression = re.compile(r'\b(?:\d+ ?)+\b')
from_expression = re.compile(r'^от\s(?:\d+ ?)+[^\d]*$')
up_to_expression = re.compile(r'до\s(?:\d+ ?)+[^\d]*$')


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
