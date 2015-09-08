# Moogle Server Info

## Setting up for development of moogle server


## AWS deployment
on deployment machine
- sudo pip install awsebcli   //installs elasticbeanstalk command line interface version 3
- eb init Moogle              //initialises the node app as a elastice beanstalk application called Moogle
- eb create moogle-test -db.engine postgres -db.i db.t2.micro -i t2.micro
- eb deploy moogle-test       //deploys the current code in the current file system
- eb create moogle-production -db.engine postgres -db.i db.t2.micro -i t2.micro
- eb deploy moogle-production

- eb use moogle-test

- eb use moogle-production

eb will only deploy checked in code



db root password is agritech

NB: at this point we required the latest version of the web app and landing page to be copied to the public directory before deployment
this can be achieved by running make build in the repository root directory


## Installing server for development or deployment
make install

## Running node unit tests
The node unit tests use Mocha and can be run with
make test

note there must be a running Moogle server for the tests to run against

## running server locally
make restart

## stop server
make stop

## start server
make run

## run for production
make restart-production

## view server status
make status


