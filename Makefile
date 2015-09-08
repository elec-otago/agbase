# The user that the web front end will be run as
WEB_USER=admin
# web address of API (should be something like https://instanceadrress.co.nz/api/)
API_ADDRESS=<api_address>

all:	build run

web-install:
	cd web-app && sudo -u ${WEB_USER} $(MAKE) install

vm-install:
	cd deployment/vm-setup && $(MAKE) pg-install
	cd deployment/vm-setup && $(MAKE) mongo-install
	cd deployment/vm-setup && $(MAKE) node-install

server-install:
	cd server && $(MAKE) install
	
install-dependancies: vm-install server-install web-install
	echo "Install Complete"


release-build:
	cd web-app && $(MAKE) release #web-app is built on install
	#cd web-app && $(MAKE) build
	cd web-landing && $(MAKE) build
	cd server && $(MAKE) build
	-rm -r server/public/ng
	-rm -r server/public/landing
	cp -r web-app/bin server/public/ng/
	cp -r web-landing/build server/public/landing/

build:
	cd web-app && $(MAKE) build #web-app is built on install
	cd web-landing && $(MAKE) build
	cd server && $(MAKE) build
	-rm -r server/public/ng
	-rm -r server/public/landing
	-rm -r server/public/docs/ngdoc/
	cp -r web-app/build server/public/ng/
	cp -r web-landing/build server/public/landing/
	cp -r web-app/docs server/public/docs/ngdoc/

clean:
	-killall npm
	-killall node
	-pm2 kill all

test:
	cd web-app && $(MAKE) test
	#cd server && $(MAKE) test

run:
	cd server && $(MAKE) run

stop:
	cd server && $(MAKE) stop

populate-mongodb:
	cd examples/uploading_data/ && python demo_init.py ${API_ADDRESS}

populate-demo-farm: 
	cd examples/upload_from_postgres && python transfer.py --production

install: install-dependancies test run

.PHONY: install run test build install-dependancies

update-master:
	git pull origin master

deploy:
	cd deployment && ./deploy.sh

#this is to be run on the deployment machine only i.e awsbot
eb-deploy-test: build
	cd server && make deploy-test

#deploy latest version from GIT
deploy-test: update-master eb-deploy-test

eb-deploy-production: 
	cd server && make deploy-production

deploy-production: update-master release-build eb-deploy-production

fast:
	cd web-app && grunt build-dev

