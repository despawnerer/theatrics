.PHONY: install-deps clean migrate update update-all reimport

install-deps:
	pip install -r requirements.pip

install-test-deps:
	pip install -r test-requirements.pip

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

test:
	nosetests
