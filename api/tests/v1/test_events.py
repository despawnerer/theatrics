from ..utils import APITestCase, run_sync
from ..factories import Event


class EventListTestCase(APITestCase):
    def test_ok_by_default(self):
        response = self.get('/v1/events/')
        self.assertEqual(response.status_code, 200)


class EventTestCase(APITestCase):
    @run_sync
    async def test_returns_item(self):
        data = {'name': "Some event"}
        id_ = await Event.create(**data)

        response = self.get('/v1/events/%d/' % id_)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            'id': id_,
            'type': 'event',
            'name': "Some event",
        })

    def test_404_on_nonexisting(self):
        response = self.get('/v1/events/999/')
        self.assertEqual(response.status_code, 404)
