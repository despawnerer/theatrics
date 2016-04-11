import asyncio
import click
from datetime import datetime

from importer import (
    update as do_update,
    initialize as do_initialize,
)


@click.group()
def import_():
    pass


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

    _run_in_async_loop(do_update(since))


@import_.command()
def initialize():
    """
    Setup empty index with alias.
    Leaves previous indices intact, but removes alises to them.
    """
    _run_in_async_loop(do_initialize())


def _run_in_async_loop(coro):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)


if __name__ == '__main__':
    import_()
