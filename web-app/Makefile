#
# Web-app Makefile
#
# Copyright (c) 2015. Elec Research.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/
# 
# Author: Tim Molteno.
#
# Pre-requisites
#
#    aptitude install bower
#
install-dependencies:
	$(info Installing dependencies...)
	npm install
	bower install

test:
	$(info Running Unit tests...)
	export CHROME_BIN=/usr/bin/chromium && grunt test

build: install-dependencies
	$(info Compiling Web App...)
	grunt build-no-test

# This target is run only when a new version is deployed
release: install-dependencies
	$(info Compiling Web App...)
	grunt release

install: build

.PHONY: build test install
