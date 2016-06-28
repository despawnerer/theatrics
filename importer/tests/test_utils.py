from unittest import TestCase

from importer.utils import (
    maybe,
    find_first,
    strip_links,
)


class MaybeTestCase(TestCase):
    def setUp(self):
        self.add_ten = maybe(lambda x: x + 10)

    def test_with_none(self):
        self.assertIsNone(self.add_ten(None))

    def test_with_different_value(self):
        self.assertEqual(self.add_ten(20), 30)


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


class StripLinksTestCase(TestCase):
    def test_strips_links(self):
        text = 'My text is <a href="aomethin">awesome</a>.'
        self.assertEqual(strip_links(text), 'My text is awesome.')
