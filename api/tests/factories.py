from theatrics.settings import ELASTICSEARCH_INDEX
from theatrics.connections import elastic


class Factory:
    doc_type = None
    current_id = 0

    @classmethod
    async def create(cls, **body):
        doc_id = cls.get_next_id()
        await elastic.index(ELASTICSEARCH_INDEX, cls.doc_type, body, doc_id)
        return doc_id

    @classmethod
    def get_next_id(cls):
        cls.current_id += 1
        return cls.current_id


class Place(Factory):
    doc_type = 'place'


class Event(Factory):
    doc_type = 'event'
