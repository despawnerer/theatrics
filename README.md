Theatrics
=========

A theater playbill app using KudaGo API. Only in Russian language right now.

Available at http://theatrics.ru/


Prerequisites
-------------

- make
- docker
- docker-compose


Development
-----------

Theatrics consists of three parts:

- `web` — web client, which is the the front-end app
- `api` — API through which access to data happens
- `importer` — index management and data importing

Elasticsearch 2.3 is used a database.


### Initial setup

    docker-compose run importer make migrate


### Running

	docker-compose up


Credits
-------

Powered by data from KudaGo.com.

Using modified versions of Liberation fonts, see copyright notice in `client/src/fonts/LiberationSerif.LICENSE`.
