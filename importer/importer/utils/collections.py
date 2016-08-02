def find_first(needles, haystack):
    for needle in needles:
        if needle in haystack:
            return needle
