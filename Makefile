test_project = docker-compose -p theatrics_test -f docker-compose.yml

.PHONY: build test clean-test

build:
	docker-compose build

test: test.run
	$(test_project) exec importer make test
	$(test_project) exec api make test

test.run:
	$(test_project) up -d --build
	$(test_project) exec importer make migrate
	$(test_project) exec importer make install-test-deps
	$(test_project) exec api make install-test-deps
	touch test.run

clean-test:
	$(test_project) down --rmi local
	rm test.run
