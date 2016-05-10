from ..utils import APITestCase, run_sync
from ..factories import Place


class PlaceListTestCase(APITestCase):
    def test_ok_by_default(self):
        response = self.get('/api/v1/places/')
        self.assertEqual(response.status_code, 200)


class PlaceTestCase(APITestCase):
    @run_sync
    async def test_returns_item(self):
        data = {'name': "Some event"}
        id_ = await Place.create(**data)

        response = self.get('/api/v1/places/%d/' % id_)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            'id': id_,
            'type': 'place',
            'name': "Some event",
        })

    def test_404_on_nonexisting(self):
        response = self.get('/api/v1/places/999/')
        self.assertEqual(response.status_code, 404)
