.PHONY: install-deps clean run run-dev

install-deps:
	pip install -r requirements.pip

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +

run:
	python -m bottle --bind 0.0.0.0:8000 sitemap

run-dev:
	python -m bottle --debug --reload --bind 0.0.0.0:8000 sitemap
