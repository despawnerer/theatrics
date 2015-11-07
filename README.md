Theatrics
=========

A nice little theater playbill sort of app using KudaGo API.


Prerequisites
-------------

- make
- node
- python 3.5


Setting up
----------

Make sure you're within configured and activated virtualenv with python 3.5.

	$ make install build


Cleaning up
-----------

To remove installed node modules and built files, as well as python's compiled files.

	$ make clean


Automatically rebuilding client
-------------------------------

	$ make watch


Running the server in development
---------------------------------

This will automatically reload the app on any python file changes.

	$ make run-dev

The server runs on `localhost:9001` by default. If you want a different port, you can change it using `host` variable:

	$ make host="localhost:9005" run-dev
