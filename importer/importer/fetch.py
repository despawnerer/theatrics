from .utils import print_fetch_progress, flatten_pages


async def fetch_theatrical_events(kudago, since=None):
    print("Fetching theatrical events...")
    return await flatten_pages(
        print_fetch_progress(
            get_theater_event_pages(kudago, since),
            'events'
        )
    )


async def fetch_theatrical_places(kudago):
    print("Fetching theatrical places...")
    return await flatten_pages(
        print_fetch_progress(
            get_theater_place_pages(kudago),
            'places'
        )
    )


def get_theater_event_pages(kudago, since=None):
    return kudago.get_all_pages(
        '/events/',
        page_size=100,
        order_by='id',
        fields='id,place,parent',
        expand='place',
        categories='theater',
        actual_since=since.timestamp() if since else 0
    )


def get_theater_place_pages(kudago):
    return kudago.get_all_pages(
        '/places/',
        page_size=100,
        order_by='id',
        fields='id',
        categories='theatre,-cafe,-kids',
    )


def get_event_pages(kudago, ids):
    return kudago.get_id_pages(
        '/events/',
        ids=ids,
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,place,'
               'images,categories,tags,dates,location,site_url,price,rank,'
               'user_rating,total_visits,is_editors_choice,favorites_count,'
               'comments_count,is_free,age_restriction',
        expand='dates,images',
    )


def get_place_pages(kudago, ids):
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
