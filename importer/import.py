import asyncio
import click
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
    if all:
        since = None
    else:
        since = datetime.now().replace(hour=0, minute=0, microsecond=0)

    run_sync(do_update(since))


@import_.command()
def reimport():
    """
    Import all data from KudaGo into a new index and switch.
    """
    run_sync(do_reimport())


def run_sync(coro):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)


if __name__ == '__main__':
    import_()
