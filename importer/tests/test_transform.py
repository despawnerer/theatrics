from unittest import TestCase

from importer.transform import (
    transform_price,
    transform_phone,
    transform_coords,
    transform_date,
    split_date,
)


class TransformPriceTestCase(TestCase):
    def test_free(self):
        self.assertEqual(
            transform_price("Whatever", True),
            {'text': "Whatever", 'lower': 0, 'upper': 0}
        )

    def test_numberless(self):
        self.assertEqual(
            transform_price("No numbers here", False),
            {'text': "No numbers here", 'lower': None, 'upper': None}
        )

    def test_from_something(self):
        self.assertEqual(
            transform_price("от 300 рублей", False),
            {'text': "от 300 рублей", 'lower': 300, 'upper': None}
        )

    def test_up_to_something(self):
        self.assertEqual(
            transform_price("до 300 рублей", False),
            {'text': "до 300 рублей", 'lower': None, 'upper': 300}
        )

    def test_exact(self):
        self.assertEqual(
            transform_price("300 рублей", False),
            {'text': "300 рублей", 'lower': 300, 'upper': 300}
        )

    def test_multiple_numbers(self):
        self.assertEqual(
            transform_price("200-300 взрослым, 100-200 детям", False),
            {'text': "200-300 взрослым, 100-200 детям", 'lower': 100, 'upper': 300}
        )


class TransformPhoneTestCase(TestCase):
    def test_empty_string(self):
        self.assertEqual(transform_phone(''), [])

    def test_one_number(self):
        self.assertEqual(transform_phone('+12345678901'), ['+12345678901'])

    def test_multiple_numbers(self):
        self.assertEqual(
            transform_phone('+12345678901, +23456789012'),
            ['+12345678901', '+23456789012']
        )


class TranformCoordsTestCase(TestCase):
    def test_none(self):
        self.assertIsNone(transform_coords(None))

    def test_none_in_coords(self):
        self.assertIsNone(transform_coords({'lat': None, 'lon': None}))

    def test_specified(self):
        incoming = {'lat': '54.67', 'lon': '31.34'}
        self.assertEqual(transform_coords(incoming), {'lat': 54.67, 'lon': 31.34})


class TransformDateTestCase(TestCase):
    def test_full_datetimes(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': '14:00:00',
                'end_date': '2016-04-04',
                'end_time': '16:00:00',
                'is_continuous': False
            }),
            {
                'start': '2016-04-04T14:00:00',
                'end': '2016-04-04T16:00:00',
            }
        )

    def test_missing_end_date(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': '16:00:00',
                'is_continuous': False
            }),
            {
                'start': '2016-04-04T14:00:00',
                'end': '2016-04-04T16:00:00',
            }
        )

    def test_missing_end_time(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': '14:00:00',
                'end_date': '2016-04-04',
                'end_time': None,
                'is_continuous': False
            }),
            {
                'start': '2016-04-04T14:00:00',
                'end': '2016-04-04T14:00:00',
            }
        )

    def test_equal_end_and_start_times(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': '10:00:00',
                'end_date': None,
                'end_time': '10:00:00',
                'is_continuous': False
            }),
            {
                'start': '2016-04-04T10:00:00',
                'end': '2016-04-05T10:00:00',
            }
        )

    def test_end_time_overflow(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': '23:00:00',
                'end_date': None,
                'end_time': '01:00:00',
                'is_continuous': False
            }),
            {
                'start': '2016-04-04T23:00:00',
                'end': '2016-04-05T01:00:00',
            }
        )

    def test_date_based(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': None,
                'end_date': '2016-04-04',
                'end_time': None,
                'is_continuous': False
            }),
            {
                'start': '2016-04-04',
                'end': '2016-04-04',
            }
        )

    def test_continuous(self):
        self.assertEqual(
            transform_date({
                'start_date': '2016-04-04',
                'start_time': '19:00:00',
                'end_date': '2016-04-06',
                'end_time': '13:00:00',
                'is_continuous': True
            }),
            {
                'start': '2016-04-04T19:00:00',
                'end': '2016-04-06T13:00:00',
            }
        )


class SplitDateTestCase(TestCase):
    def test_continuous(self):
        spec = {
            'start_date': '2016-08-01',
            'start_time': '19:00:00',
            'end_date': '2016-08-14',
            'end_time': '10:00:00',
            'is_continuous': True,
            'schedules': [],
        }
        self.assertCountEqual(split_date(spec), [
            {
                'start_date': '2016-08-01',
                'start_time': '19:00:00',
                'end_date': '2016-08-14',
                'end_time': '10:00:00',
                'is_continuous': True,
            }
        ])

    def test_single_day_with_no_end_date(self):
        spec = {
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': None,
            'end_time': '13:10:00',
            'is_continuous': False,
            'schedules': [],
        }
        self.assertCountEqual(split_date(spec), [{
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': None,
            'end_time': '13:10:00',
            'is_continuous': False,
        }])

    def test_single_day_with_end_date(self):
        spec = {
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': '2014-04-27',
            'end_time': '13:10:00',
            'is_continuous': False,
            'schedules': [],
        }
        self.assertCountEqual(split_date(spec), [{
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': None,
            'end_time': '13:10:00',
            'is_continuous': False,
        }])

    def test_multi_day_without_schedule(self):
        spec = {
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': '2014-04-29',
            'end_time': '13:10:00',
            'is_continuous': False,
            'schedules': [],
        }
        self.assertCountEqual(split_date(spec), [
            {
                'start_date': '2014-04-27',
                'start_time': '12:30:00',
                'end_date': None,
                'end_time': '13:10:00',
                'is_continuous': False,
            },
            {
                'start_date': '2014-04-28',
                'start_time': '12:30:00',
                'end_date': None,
                'end_time': '13:10:00',
                'is_continuous': False,
            },
            {
                'start_date': '2014-04-29',
                'start_time': '12:30:00',
                'end_date': None,
                'end_time': '13:10:00',
                'is_continuous': False,
            },
        ])

    def test_multi_day_with_schedule(self):
        spec = {
            'start_date': '2016-08-01',
            'start_time': None,
            'end_date': '2016-08-14',
            'end_time': None,
            'is_continuous': False,
            'schedules': [
                {
                    'days_of_week': [0, 6],
                    'start_time': '14:00:00',
                    'end_time': None,
                }
            ],
        }
        self.assertCountEqual(split_date(spec), [
            {
                'start_date': '2016-08-01',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-07',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-08',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-14',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
        ])

    def test_multiple_schedules_on_one_day(self):
        spec = {
            'start_date': '2016-08-01',
            'start_time': None,
            'end_date': '2016-08-07',
            'end_time': None,
            'is_continuous': False,
            'schedules': [
                {
                    'days_of_week': [0, 6],
                    'start_time': '14:00:00',
                    'end_time': None,
                },
                {
                    'days_of_week': [0, 6],
                    'start_time': '19:00:00',
                    'end_time': None,
                },
            ],
        }
        self.assertCountEqual(split_date(spec), [
            {
                'start_date': '2016-08-01',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-01',
                'start_time': '19:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-07',
                'start_time': '14:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-07',
                'start_time': '19:00:00',
                'end_date': None,
                'end_time': None,
                'is_continuous': False,
            },
        ])
