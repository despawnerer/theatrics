from urllib.parse import parse_qs, urlencode


__all__ = ['build_uri']


def build_uri(path, query_string, **params):
    query = parse_qs(query_string)
    for k, v in params.items():
        if v is None and k in query:
            del query[k]
        elif v is not None:
            query[k] = v
    new_qs = urlencode(query, True)
    return '{}?{}'.format(path, new_qs) if new_qs else path
