from datetime import datetime


__all__ = ['get_today']


def get_today():
    return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
