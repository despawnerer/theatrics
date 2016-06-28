import sys
from unittest import TestCase
from io import StringIO
from contextlib import contextmanager

from importer.utils import (
    safe_crash,
    maybe,
    find_first,
    strip_links,
)


@contextmanager
def capture_output():
    real_stdout, real_stderr = sys.stdout, sys.stderr
    try:
        sys.stdout, sys.stderr = StringIO(), StringIO()
        yield sys.stdout, sys.stderr
    finally:
        sys.stdout, sys.stderr = real_stdout, real_stderr


class SafeCrashTestCase(TestCase):
    def test_doesnt_actually_crash_on_exception(self):
        with capture_output():
            try:
                self.crashing_function()
            except:
                self.fail()

    def test_prints_traceback(self):
        with capture_output() as (stdout, stderr):
            self.crashing_function()
            output = stderr.getvalue().strip()
        self.assertTrue(output.startswith('Traceback'))
        self.assertTrue(output.endswith('ValueError'))

    @safe_crash
    def crashing_function(self):
        raise ValueError


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
