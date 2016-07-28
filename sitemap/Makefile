.PHONY: install-deps clean run run-dev

install-deps:
	pip install -r requirements.pip

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +

run:
	gunicorn sitemap:app -b 0.0.0.0:8000

run-dev:
	gunicorn sitemap:app -b 0.0.0.0:8000 --reload
