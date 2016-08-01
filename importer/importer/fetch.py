def iter_event_children_stubs(kudago, parent_id):
    return kudago.iter_all(
        '/events/',
        page_size=100,
        order_by='id',
        fields='id',
        categories='theater',
        parent_id=parent_id
    )


def iter_theatrical_event_stubs(kudago, since=None):
    return kudago.iter_all(
        '/events/',
        page_size=100,
        order_by='id',
        fields='id,place,categories,participants',
        expand='place',
        categories='theater',
        actual_since=since.timestamp() if since else 0
    )


def iter_theatrical_place_stubs(kudago):
    return kudago.iter_all(
        '/places/',
        page_size=100,
        order_by='id',
        fields='id',
        categories='theatre',
    )


def iter_full_events_by_ids(kudago, ids):
    return kudago.iter_by_ids(
        '/events/',
        ids=ids,
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,place,'
               'images,categories,tags,dates,location,site_url,price,'
               'favorites_count,comments_count,is_free,age_restriction,'
               'participants',
        expand='dates,images',
    )


def iter_full_places_by_ids(kudago, ids):
    return kudago.iter_by_ids(
        '/places/',
        ids=ids,
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,images,'
               'categories,tags,location,site_url,favorites_count,phone,'
               'comments_count,age_restriction,address,subway,timetable,'
               'foreign_url,coords,is_closed,is_stub',
        expand='images',
    )


def iter_full_agents_by_ids(kudago, ids):
    return kudago.iter_by_ids(
        '/agents/',
        ids=ids,
        page_size=100,
        order_by='id',
        fields='id,title,description,body_text,images,tags,site_url,'
               'favorites_count,comments_count,is_stub',
        expand='images',
    )
