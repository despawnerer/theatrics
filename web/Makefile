.PHONY: all install-deps build build-min watch clean clean-build clean-node-modules update-locations update-timezones

all: install-deps build

install-deps:
	npm install

build:
	./node_modules/.bin/gulp build

build-min:
	./node_modules/.bin/gulp build-min

watch:
	./node_modules/.bin/gulp watch

clean: clean-build clean-node-modules

clean-build:
	rm -rf build

clean-node-modules:
	rm -rf node_modules

update-locations:
	./node_modules/.bin/gulp update-locations

update-timezones:
	./node_modules/.bin/gulp update-timezones
