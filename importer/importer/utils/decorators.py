import traceback
from functools import wraps


__all__ = ['safe_crash', 'maybe']


def safe_crash(f):
    """
    In case the function raises an exception, print the traceback and then
    go on like nothing happened.

    This is needed to make scheduled tasks safe to run.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except:
            traceback.print_exc()
    return wrapper


def maybe(f):
    """
    Pass-through if first argument to the function is None.
    """
    @wraps(f)
    def wrapper(arg, *rest, **kwargs):
        return None if arg is None else f(arg, *rest, **kwargs)
    return wrapper
