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
