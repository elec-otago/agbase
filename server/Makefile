#
# Node.js Server makefile
#
MOCHA = ./node_modules/.bin/mocha

all: build run

depend:
	sudo npm install -g pm2
	sudo npm install -g istanbul

install:
	npm install

#
# produces a code coverage report in /coverage/lcov-report/index.html
#
test: stop
	pm2 start testConfig.json
	-grunt test
	pm2 stop testConfig.json
	pm2 delete testConfig.json


run-test:
	NODE_ENV=unit_testing npm start

test-api:
	NODE_TLS_REJECT_UNAUTHORIZED=0 NODE_ENV=unit_testing ./node_modules/mocha/bin/mocha ./test/api/*.js --timeout 10000 --opts ./test/mocha.opts

test-db:
	NODE_TLS_REJECT_UNAUTHORIZED=0 NODE_ENV=unit_testing ./node_modules/mocha/bin/mocha ./test/database/*.js --timeout 10000 --opts ./test/mocha.opts


.PHONY: test install run


stop:
	-pm2 stop developerConfig.json
	-pm2 delete developerConfig.json


run:	build
	pm2 start developerConfig.json


restart: stop run


build: install
	grunt

status:
	pm2 list

deploy-production:
	eb use agbase-production
	eb setenv AWS_ENV=production
	eb deploy

deploy-test:
	eb use agbase-test
	eb setenv AWS_ENV=test
	eb deploy
