.PHONY: install-deps clean migrate update update-all reimport

install-deps:
	pip install -r requirements.pip

clean:
	find . -name "__pycache__" -type d -exec rm -rf {} +

migrate:
	python import.py migrate

update:
	python import.py update

update-all:
	python import.py update --all

reimport:
	python import.py reimport
