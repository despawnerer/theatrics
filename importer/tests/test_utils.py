from unittest import TestCase

from importer.utils import find_first


class FindFirstTestCase(TestCase):
    def test_first_in_haystack(self):
        self.assertEqual(
            find_first(
                ['one', 'two', 'three'],
                ['one', 'four']
            ),
            'one',
        )

    def test_second_in_haystack(self):
        self.assertEqual(
            find_first(
                ['one', 'two', 'three'],
                ['two', 'four']
            ),
            'two',
        )

    def test_none_present(self):
        self.assertIsNone(
            find_first(
                ['one', 'two', 'three'],
                ['four']
            )
        )
