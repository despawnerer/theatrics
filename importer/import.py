import click
import schedule
import asyncio

from importer.utils import run_sync, get_today
from importer import (
    update as do_update,
    migrate as do_migrate,
    reimport as do_reimport,
)


@click.group()
def import_():
    pass


@import_.command()
@run_sync
async def migrate():
    """
    Create a new index, copy old data, switch.
    """
    await do_migrate()


@import_.command()
@click.option('--all', is_flag=True, help="Load all events, including past ones")
@run_sync
async def update(all):
    """
    Import events and places from KudaGo.
    """
    since = None if all else get_today()
    await do_update(since)


@import_.command()
@run_sync
async def reimport():
    """
    Import all data into a new index and switch.
    """
    await do_reimport()


@import_.command()
@run_sync
async def autoupdate():
    """
    Start automatic update on schedule.

    Quick (actual-only) updates are run every hour.
    Full updates are run every Monday.
    """
    schedule.every().monday.do(
        lambda: asyncio.ensure_future(do_update(None)))
    schedule.every().hour.do(
        lambda: asyncio.ensure_future(do_update(get_today())))
    while True:
        schedule.run_pending()
        await asyncio.sleep(1)


if __name__ == '__main__':
    import_()
