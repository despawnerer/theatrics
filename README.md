Theatrics
=========

A theater playbill app using KudaGo API. Only in Russian language right now.

Available at http://theatrics.ru/


Prerequisites
-------------

- make
- node 5.x
- python 3.5
- elasticsearch 2.3


Development
-----------

### Setting up

Make sure you're within configured and activated virtualenv with python 3.5.

	$ make quickstart-dev


### Running

This will automatically reload the app on any python file changes.

	$ make run-dev

The server runs on `localhost:9001` by default. If you want a different port, you can change it using `host` variable:

	$ make run-dev host="localhost:9005"


### Cleaning up

Remove installed node modules, built files, and python bytecode cache:

	$ make clean

Remove only node modules:

	$ make clean-node-modules

Remove only python bytecode cache:

	$ make clean-pycache


### Automatically rebuilding client

	$ make watch


### Migrating elasticsearch mapping changes

	$ make migrate


### Updating timezones list

	$ make update-timezones


### Updating locations list

	$ make update-locations


Credits
-------

Powered by data from KudaGo.com.

Using modified versions of Liberation fonts, see copyright notice in `client/src/fonts/LiberationSerif.LICENSE`.
