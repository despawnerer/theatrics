from unittest import TestCase

from importer.transform import split_date


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
            'end_date': '2014-04-27',
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
                'end_date': '2014-04-27',
                'end_time': '13:10:00',
                'is_continuous': False,
            },
            {
                'start_date': '2014-04-28',
                'start_time': '12:30:00',
                'end_date': '2014-04-28',
                'end_time': '13:10:00',
                'is_continuous': False,
            },
            {
                'start_date': '2014-04-29',
                'start_time': '12:30:00',
                'end_date': '2014-04-29',
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
                'end_date': '2016-08-01',
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-07',
                'start_time': '14:00:00',
                'end_date': '2016-08-07',
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-08',
                'start_time': '14:00:00',
                'end_date': '2016-08-08',
                'end_time': None,
                'is_continuous': False,
            },
            {
                'start_date': '2016-08-14',
                'start_time': '14:00:00',
                'end_date': '2016-08-14',
                'end_time': None,
                'is_continuous': False,
            },
        ])
