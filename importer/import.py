import click
import schedule
from time import sleep

from importer.utils.dates import get_today
from importer.utils.decorators import safe_crash
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
    Create a new index, copy old data, switch.
    """
    do_migrate()


@import_.command()
@click.option('--all', is_flag=True, help="Load all events, including past ones")
def update(all):
    """
    Import events and places from KudaGo.
    """
    since = None if all else get_today()
    do_update(since)


@import_.command()
def reimport():
    """
    Import all data into a new index and switch.
    """
    do_reimport()


@import_.command()
def autoupdate():
    """
    Start automatic update on schedule.

    Quick (actual-only) updates are run every hour.
    Full updates are run every Monday.
    """
    safe_update = safe_crash(do_update)
    schedule.every().monday.do(lambda: safe_update(None))
    schedule.every().hour.do(lambda: safe_update(get_today()))
    while True:
        schedule.run_pending()
        sleep(1)


if __name__ == '__main__':
    import_()
