def project(dictionary, keys):
    return {key: dictionary[key] for key in keys if key in dictionary}


def compact(iterable):
    return filter(None, iterable)


def get_first(dictionary, keys, default=None):
    for key in keys:
        try:
            return dictionary[key]
        except KeyError:
            pass
    else:
        return default
