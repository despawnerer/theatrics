import re


__all__ = ['strip_links', 'find_numbers', 'is_from_string', 'is_up_to_string']


link_expression = re.compile(r'<a .*?href=".*?".*?>(.+?)<\/a>', re.DOTALL)
number_expression = re.compile(r'\b(?:\d+ ?)+\b')
from_expression = re.compile(r'^от\s(?:\d+ ?)+[^\d]*$')
up_to_expression = re.compile(r'до\s(?:\d+ ?)+[^\d]*$')


def strip_links(text):
    return link_expression.sub('\\1', text)


def find_numbers(text):
    return [
        int(''.join(filter(str.isdigit, s)))
        for s in number_expression.findall(text)
        if s.strip()
    ]


def is_from_string(text):
    return bool(from_expression.match(text))


def is_up_to_string(text):
    return bool(up_to_expression.match(text))
