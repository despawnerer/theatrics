from unittest import TestCase

from importer.transform import split_date


class SplitDateTestCase(TestCase):
    def test_split_single_with_explicit_end(self):
        spec = {
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': '2014-04-27',
            'end_time': '13:10:00',
            'is_continuous': False,
            'schedules': [],
        }
        split_specs = list(split_date(spec))
        self.assertEqual(len(split_specs), 1)
        self.assertEqual(split_specs[0], {
            'start_date': '2014-04-27',
            'start_time': '12:30:00',
            'end_date': '2014-04-27',
            'end_time': '13:10:00',
            'is_continuous': False,
        })
