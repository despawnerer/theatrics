from ..utils import APITestCase, refresh_index, run_sync
from ..factories import Place, Event


class SearchTestCase(APITestCase):
    @run_sync
    async def test_finds_items_by_name(self):
        await Place.create(name="Ненаходимое место")
        matching_items = {
            ('place', await Place.create(name="Тестовое место")),
            ('event', await Event.create(name="Тестовое событие"))
        }
        await refresh_index()

        response = self.get('/api/v1/search/', params={'q': 'Тестовое'})
        self.assertEqual(response.status_code, 200)

        data = response.json()
        items = {(item['type'], item['id']) for item in data['items']}
        self.assertEqual(items, matching_items)

    def test_returns_bad_request_without_query(self):
        response = self.get('/api/v1/search/')
        self.assertEqual(response.status_code, 400)
