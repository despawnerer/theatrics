import asyncio
import click
import schedule
import time
from datetime import datetime

from importer import (
    update as do_update,
    migrate as do_migrate,
    reimport as do_reimport,
)


@click.group()
def import_():
    pass


@import_.command()
def migrate():
    """
    Create a new index, copy old data into it if any, switch.
    """
    run_sync(do_migrate())


@import_.command()
@click.option('--all', is_flag=True, help="Load all events, including past ones")
def update(all):
    """
    Import events and places from KudaGo.
    """
    since = None if all else get_today()
    run_sync(do_update(since))


@import_.command()
def reimport():
    """
    Import all data from KudaGo into a new index and switch.
    """
    run_sync(do_reimport())


@import_.command()
def autoupdate():
    """
    Start automatic update on schedule.

    Quick (actual-only) updates are run every hour.
    Full updates are run every Monday.
    """
    schedule.every().monday.do(lambda: run_sync(do_update(None)))
    schedule.every().hour.do(lambda: run_sync(do_update(get_today())))
    while True:
        schedule.run_pending()
        time.sleep(1)


def get_today():
    return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)


def run_sync(coro):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)


if __name__ == '__main__':
    import_()
