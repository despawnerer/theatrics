import json


__all__ = ['read_json_file']


def read_json_file(filename):
    with open(filename) as f:
        return json.loads(f.read())
