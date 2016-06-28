import requests
from time import sleep
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlencode
from funcy import chunks


KUDAGO_API_BASE_URL = 'http://kudago.com/public-api/'


class KudaGo:
    def __init__(self, session=None, version='1.2'):
        self.base_url = urljoin(KUDAGO_API_BASE_URL, 'v%s/' % version)
        self.session = session or requests.Session()
        self.version = version
        self.max_attempts = 3
        self.minimum_delay = timedelta(seconds=0.3)
        self.last_call_dt = datetime.min

    def get(self, path, **params):
        url = self.build_url(path, params)
        for attempt in range(self.max_attempts):
            try:
                return self._call(url)
            except InternalError:
                if attempt + 1 == self.max_attempts:
                    raise

    def get_all(self, path, **params):
        for page in self.get_all_pages(path, **params):
            for item in page:
                yield item

    def get_all_pages(self, path, **params):
        next_url = self.build_url(path, params)
        while next_url:
            data = self.get(next_url)
            next_url = data['next']
            yield data['results']

    def get_ids(self, path, ids, page_size, **params):
        for page in self.get_id_pages(path, ids, page_size, **params):
            for item in page:
                yield item

    def get_id_pages(self, path, ids, page_size, **params):
        for ids_chunk in chunks(page_size, ids):
            data = self.get(path, ids=','.join(map(str, ids_chunk)), **params)
            yield data['results']

    def build_url(self, path, params):
        url = urljoin(self.base_url, path.lstrip('/'))
        qs = urlencode(params)
        return '%s?%s' % (url, qs) if qs else url

    def _call(self, url):
        time_since_last_call = datetime.now() - self.last_call_dt
        if time_since_last_call < self.minimum_delay:
            delay = (self.minimum_delay - time_since_last_call).total_seconds()
            sleep(delay)

        self.last_call_dt = datetime.now()
        response = self.session.get(url)
        return self.handle_response(response)

    def handle_response(self, response):
        if response.status_code == 200:
            # TODO: can this return errors?
            return response.json()
        elif 500 <= response.status_code < 600:
            raise InternalError(response)
        else:
            raise HTTPError(response)


class HTTPError(Exception):
    def __init__(self, response):
        self.status = response.status
        self.reason = response.reason

    def __str__(self):
        return "{} {}".format(self.status, self.reason)


class InternalError(HTTPError):
    pass
