def get_default_score_functions():
    return [
        {
            'field_value_factor': {
                'field': 'favorites_count',
                'modifier': 'log2p',
                'missing': 0,
            },
        },
        {
            'field_value_factor': {
                'field': 'comments_count',
                'modifier': 'log2p',
                'missing': 0,
            },
        },
        {
            'field_value_factor': {
                'field': 'events_count',
                'modifier': 'log2p',
                'missing': 0,
            },
        },
        {
            'gauss': {
                'dates_count': {
                    'origin': 0,
                    'scale': 5,
                },
            },
        },
    ]
