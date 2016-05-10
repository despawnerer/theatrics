.PHONY: install-deps clean run-dev

install-deps:
	pip install -r requirements.pip

install-test-deps:
	pip install -r test-requirements.pip

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +

test:
	nosetests --nocapture

run:
	gunicorn theatrics:app -k aiohttp.worker.GunicornWebWorker -b 0.0.0.0:8000

run-dev:
	gunicorn theatrics:app -k aiohttp.worker.GunicornWebWorker -b 0.0.0.0:8000 --reload
