host = localhost:9001

.PHONY: clean install-deps install-server-deps install-client-deps update-locations update-timezones build build-min watch run run-dev

# clean up

clean:
	rm -rf client/build
	rm -rf client/node_modules
	rm -rf server/app/__pycache__

clean-node-modules:
	rm -rf client/node_modules

# dependencies

install-deps:
	cd server && pip install -r requirements.pip
	cd importer && pip install -r requirements.pip
	cd client && npm install

install-server-deps:
	cd server && pip install -r requirements.pip

install-importer-deps:
	cd importer && pip install -r requirements.pip

install-client-deps:
	cd client && npm install

# data updates

update-locations:
	cd client && npm run update-locations

update-timezones:
	cd client && npm run update-timezones

# building

build:
	cd client && npm run build

build-min:
	cd client && npm run build-min

watch:
	cd client && npm run watch

# running

run:
	honcho start -f deploy/Procfile

run-dev:
	cd server && gunicorn app:app -k aiohttp.worker.GunicornWebWorker -b $(host) -e THEATRICS_DEBUG=true --reload
