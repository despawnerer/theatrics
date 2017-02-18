Theatrics Web Client
====================

This is the web client for Theatrics.

It is managed by a simple Makefile.


Things you can do
-----------------

### Full build

    make


### Install or upgrade dependencies

    make install-deps


### Building

Build in development mode:

    make build

Automatically rebuild on file changes:

    make watch

Build minified files:

    make build-min


### Cleanup

Remove installed node modules and built files:

    make clean

Remove only node modules:

    make clean-node-modules

Remove only built files:

    make clean-build


### Updating data

Update location list if it needs changes:

    make update-locations

Update timezone list:

    make update-timezones

Update role list:

    make update-roles
