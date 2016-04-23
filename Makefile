host = localhost:9001

.PHONY: clean clean-build clean-node-modules clean-pycache install-deps install-server-deps install-client-deps install-importer-deps update-locations update-timezones build build-min watch migrate run run-dev

quickstart-dev: | clean install-deps build migrate

# clean up

clean: | clean-build clean-node-modules clean-pycache

clean-build:
	rm -rf client/build

clean-node-modules:
	rm -rf client/node_modules

clean-pycache:
	find . -name "__pycache__" -type d -exec rm -rf {} +

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

# upgrading

migrate:
	cd importer && python import.py migrate

# running

run:
	honcho start -f deploy/Procfile

run-dev:
	cd server && gunicorn app:app -k aiohttp.worker.GunicornWebWorker -b $(host) -e THEATRICS_DEBUG=true --reload
