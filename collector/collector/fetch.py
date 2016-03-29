def fetch_theater_event_pages(kudago):
    return kudago.get_all_pages(
        '/events/',
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,place,'
               'images,categories,tags,dates,location,site_url,price,rank,'
               'user_rating,total_visits,is_editors_choice,favorites_count,'
               'comments_count,is_free,age_restriction',
        expand='dates,images,place',
        categories='theater',
    )


def fetch_theater_place_pages(kudago):
    return kudago.get_all_pages(
        '/places/',
        page_size=100,
        order_by='id',
        fields='id,title,short_title,tagline,description,body_text,images,'
               'images,categories,tags,location,site_url,rank,user_rating,'
               'total_visits,is_editors_choice,favorites_count,phone,'
               'comments_count,age_restriction,address,subway,timetable,'
               'foreign_url,coords,is_closed,is_stub',
        expand='images',
        categories='theatre,-cafe,-kids',
    )
