def get_all(dictionary, keys):
    return tuple(dictionary[k] for k in keys if k in dictionary)
