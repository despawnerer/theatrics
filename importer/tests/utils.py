import sys
from io import StringIO
from contextlib import contextmanager


@contextmanager
def capture_output():
    real_stdout, real_stderr = sys.stdout, sys.stderr
    try:
        sys.stdout, sys.stderr = StringIO(), StringIO()
        yield sys.stdout, sys.stderr
    finally:
        sys.stdout, sys.stderr = real_stdout, real_stderr
