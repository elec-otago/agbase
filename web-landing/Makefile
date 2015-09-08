#
#  Landing page make file
#
install-dependencies:
	$(info Installing dependencies...)
	npm install
	bower install

build: install-dependencies
	$(info Compiling Landing Page...)
	grunt build

install: install-dependencies build

.PHONY: build install