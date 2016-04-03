def fetch_theater_events(kudago, since):
    return kudago.get_all_pages(
        '/events/',
        page_size=100,
        order_by='id',
        fields='id,place,parent',
        expand='place',
        categories='theater',
        actual_since=since.timestamp()
    )


def fetch_theater_places(kudago):
    return kudago.get_all_pages(
        '/places/',
        page_size=100,
        order_by='id',
        fields='id',
        categories='theatre,-cafe,-kids',
    )


def fetch_event_pages(kudago, ids):
    return kudago.get_id_pages(
        '/events/',
        ids=ids,
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,place,'
               'images,categories,tags,dates,location,site_url,price,rank,'
               'user_rating,total_visits,is_editors_choice,favorites_count,'
               'comments_count,is_free,age_restriction',
        expand='dates,images,place',
    )


def fetch_place_pages(kudago, ids):
    return kudago.get_id_pages(
        '/places/',
        ids=ids,
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,images,'
               'images,categories,tags,location,site_url,rank,user_rating,'
               'total_visits,is_editors_choice,favorites_count,phone,'
               'comments_count,age_restriction,address,subway,timetable,'
               'foreign_url,coords,is_closed,is_stub',
        expand='images',
    )
