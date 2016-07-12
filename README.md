Theatrics
=========

[![Build Status](https://travis-ci.org/despawnerer/theatrics.svg?branch=master)](https://travis-ci.org/despawnerer/theatrics)

A theater playbill app using KudaGo API. Only in Russian language right now.

Available at http://theatrics.ru/


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
