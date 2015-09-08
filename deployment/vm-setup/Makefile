INSTALL=sudo apt-get -y install

pre-install:
	#sudo apt-get -y update && sudo apt-get upgrade
	${INSTALL} curl git rsync

pg-install: pre-install
	${INSTALL} postgresql postgresql-client postgresql-contrib rsync python-psycopg2
	# replace password with real password 
	-sudo useradd pguser -G www-data -m -p <password>
	-sudo -u postgres psql -c "create user pguser with password '<password>'"
	-sudo -u postgres createdb wowdb -O pguser
	
mongo-install: pre-install
	${INSTALL} mongodb

node-install:
	${INSTALL} npm redis-server nodejs nodejs-legacy
	-sudo npm install -g grunt-cli karma bower pm2

install: pg-install mongo-install node-install
	echo "Install complete"
