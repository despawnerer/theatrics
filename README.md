Theatrics
=========

A nice little theater playbill sort of app using KudaGo API. Only in Russian language right now.

Available at http://theatrics.plansfortheday.org/


Prerequisites
-------------

- make
- node
- python 3.5


Development
-----------

### Setting up

Make sure you're within configured and activated virtualenv with python 3.5.

	$ make clean install-deps build


### Cleaning up

Remove installed node modules and built files, as well as python's compiled files:

	$ make clean

Remove only node modules:

	$ make clean-deps


### Automatically rebuilding client

	$ make watch


### Running

This will automatically reload the app on any python file changes.

	$ make run-dev

The server runs on `localhost:9001` by default. If you want a different port, you can change it using `host` variable:

	$ make run-dev host="localhost:9005"


Deploying
---------

### Docker

Use supplied `Dockerfile` to build and run a Docker image.


### Prerequisites

- nginx
- honcho (via pip)


### Building

	$ make build-min


### Running

The nginx configuration in `deploy/nginx.conf` assumes that the code is built and resides in `/www/theatrics/`

	$ make run


Credits
-------

Powered by data from KudaGo.com.

Using modified versions of Liberation fonts, see copyright notice in `client/src/fonts/LiberationSerif.LICENSE`.
