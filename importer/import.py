import asyncio
from importer import do_import


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(do_import())
