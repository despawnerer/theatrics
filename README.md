Theatrics
=========

**This project is here for historical purposes. I'm not doing any more work on it (at least not any time soon). If you have questions, feel free to ask.**

A theater playbill app using data from KudaGo. Only in Russian language right now.


Prerequisites
-------------

- make
- docker
- docker-compose


Development
-----------

Theatrics consists of four parts:

- `web` — frontend and web client
- `api` — API through which access to data happens
- `importer` — index management and data importing
- `sitemap` — dynamic sitemap generation

Elasticsearch 2.3 is used as a database.


### Initial setup

    docker-compose run importer make migrate


### Running

    docker-compose up


### Testing

Build and setup test containers (if they aren't already) and run tests:

    make test

Clean up and remove test containers:

    make clean-test



Credits
-------

Powered by data from KudaGo.com.

Using modified versions of Liberation fonts, see copyright notice in `client/src/fonts/LiberationSerif.LICENSE`.
