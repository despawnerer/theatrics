import asyncio
import click
from importer import update as do_update, create as do_create


@click.group()
def import_():
    pass


@import_.command()
def update():
    """
    Import events and places from KudaGo.
    """
    _run_in_async_loop(do_update())


@import_.command()
def create():
    """
    Setup empty index with alias.
    """
    _run_in_async_loop(do_create())


def _run_in_async_loop(coro):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(coro)


if __name__ == '__main__':
    import_()
