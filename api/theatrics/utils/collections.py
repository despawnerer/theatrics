def project(dictionary, keys):
    return {key: dictionary[key] for key in keys if key in dictionary}


def compact(iterable):
    return filter(None, iterable)
