def print_progress(iterable, message, every=100):
    count = 0
    for count, item in enumerate(iterable, 1):
        yield item
        if count % every == 0:
            print(message % count)
    if count % every != 0 or count == 0:
        print(message % count)
