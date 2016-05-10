import requests
import asyncio
from functools import wraps
from urllib.parse import urljoin
from unittest import TestCase

from theatrics.settings import ELASTICSEARCH_INDEX
from theatrics.connections import elastic


def run_sync(coro):
    @wraps(coro)
    def wrapper(*args, **kwargs):
        future = coro(*args, **kwargs)
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(future)
    return wrapper


class APITestCase(TestCase):
    @run_sync
    async def tearDown(self):
        await clear_index()
        await refresh_index()

    def get(self, path, *args, **kwargs):
        return requests.get(
            urljoin('http://127.0.0.1:8000', path), *args, **kwargs)


async def clear_index():
    async for item in IndexScanner(elastic, ELASTICSEARCH_INDEX):
        await elastic.delete(
            ELASTICSEARCH_INDEX,
            item['_type'],
            item['_id'],
        )


async def refresh_index():
    await elastic.indices.refresh(ELASTICSEARCH_INDEX)


class IndexScanner:
    def __init__(self, elastic, index_name, scroll_time='1m'):
        self.elastic = elastic
        self.index_name = index_name
        self.scroll_time = scroll_time
        self.buffer = None
        self.scroll_id = None

    async def __aiter__(self):
        return self

    async def __anext__(self):
        if self.scroll_id is None:
            response = await self.elastic.search(
                self.index_name,
                scroll=self.scroll_time,
            )
            self.scroll_id = response['_scroll_id']
            self.buffer = response['hits']['hits']
        elif not self.buffer:
            response = await self.elastic.scroll(
                self.scroll_id,
                scroll=self.scroll_time,
            )
            self.scroll_id = response['_scroll_id']
            self.buffer = response['hits']['hits']

        if self.buffer:
            return self.buffer.pop(0)
        else:
            await self.elastic.clear_scroll(self.scroll_id)
            raise StopAsyncIteration
