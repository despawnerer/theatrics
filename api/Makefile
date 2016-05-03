host = localhost:9001

.PHONY: install-deps clean run-dev

install-deps:
	pip install -r requirements.pip

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +

run-dev:
	gunicorn theatrics:app -k aiohttp.worker.GunicornWebWorker -b $(host) -e THEATRICS_DEBUG=true --reload
