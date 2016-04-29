import asyncio
from copy import copy
from math import ceil
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlencode


KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/'


class KudaGo:
    def __init__(self, client, version='1.2'):
        self.base_url = urljoin(KUDAGO_API_BASE_URL, 'v%s/' % version)
        self.client = client
        self.version = version
        self.max_attempts = 3
        self.minimum_delay = timedelta(seconds=0.3)
        self.last_call_dt = datetime.min

    async def get(self, path, **params):
        url = self.build_url(path, params)
        for attempt in range(self.max_attempts):
            try:
                return await self._call(url)
            except InternalError:
                if attempt + 1 == self.max_attempts:
                    raise

    def get_all(self, path, **params):
        return ListIterator(self, path, params)

    def get_all_pages(self, path, **params):
        return Paginator(self, path, params)

    def get_ids(self, path, ids, page_size, **params):
        raise NotImplementedError

    def get_id_pages(self, path, ids, page_size, **params):
        return IDListPaginator(self, path, ids, page_size, params)

    def build_url(self, path, params):
        url = urljoin(self.base_url, path.lstrip('/'))
        qs = urlencode(params)
        return '%s?%s' % (url, qs) if qs else url

    async def _call(self, url):
        time_since_last_call = datetime.now() - self.last_call_dt
        if time_since_last_call < self.minimum_delay:
            delay = (self.minimum_delay - time_since_last_call).total_seconds()
            await asyncio.sleep(delay)

        self.last_call_dt = datetime.now()
        async with self.client.get(url) as response:
            return await self.handle_response(response)

    async def handle_response(self, response):
        if response.status == 200:
            # TODO: can this return errors?
            return await response.json()
        elif 500 <= response.status < 600:
            raise InternalError(response)
        else:
            raise HTTPError(response)


# errors

class HTTPError(Exception):
    def __init__(self, response):
        self.status = response.status
        self.reason = response.reason

    def __str__(self):
        return "{} {}".format(self.status, self.reason)


class InternalError(HTTPError):
    pass


# iterators

class Paginator:
    def __init__(self, api, path, params):
        self.api = api
        self.next = api.build_url(path, params)
        self.item_count = None

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if self.next:
            data = await self.api.get(self.next)
            self.next = data['next']
            self.item_count = data['count']
            return data['results']
        else:
            raise StopAsyncIteration


class IDListPaginator:
    def __init__(self, api, path, ids, page_size, params):
        self.api = api
        self.path = path
        self.ids = list(ids)
        self.page_size = page_size
        self.params = params

        self.item_count = len(ids)
        self.page_count = ceil(self.item_count / self.page_size)
        self.page_number = 1

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if self.page_number <= self.page_count:
            params = self.get_params()
            data = await self.api.get(self.path, **params)
            self.page_number += 1
            return data['results']
        else:
            raise StopAsyncIteration

    def get_params(self):
        from_index = (self.page_number - 1) * self.page_size
        to_index = from_index + self.page_size
        params = copy(self.params)
        params['ids'] = ','.join(map(str, self.ids[from_index:to_index]))
        params['page_size'] = self.page_size
        return params


class ListIterator:
    def __init__(self, api, path, params):
        self.api = api
        self.next = api.build_url(path, params)
        self.buffer = None
        self.item_count = None

    def __len__(self):
        return self.item_count

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if not self.buffer:
            if self.next:
                data = await self.api.get(self.next)
                self.next = data['next']
                self.item_count = data['count']
                self.buffer = data['results']
            else:
                raise StopAsyncIteration
        return self.buffer.pop(0)
