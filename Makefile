host = localhost:9001

.PHONY: install clean watch build run

clean:
	rm -rf client/app/build
	rm -rf client/node_modules
	rm -rf server/app/__pycache__

install:
	cd client && npm install
	cd server && pip install -r requirements.pip

build:
	cd client && npm run build

build-min:
	cd client && npm run build-min

watch:
	cd client && npm run watch

run-dev:
	cd server && gunicorn app:app -k aiohttp.worker.GunicornWebWorker -b $(host) --reload
