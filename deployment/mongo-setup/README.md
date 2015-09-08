#MongoDB install for Moogle

Login to server that will be used to host mongo database.

###Install MongoDb:

**Import the public key used by the package management system**

`sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10`

**Create a /etc/apt/sources.list.d/mongodb.list file for mongoDB**
`echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list`

**reload the local package database**
`sudo apt-get update`

**Install the latest stable version of MongoDB**
`sudo apt-get install -y mongodb-org`

###Setup configuration file:

**add the following lines to /etc/mongod.conf**
```
dbpath=<path to database>
logpath=<path to log file>
logappend=true
port = <port number> # This can be any port.  The default is 27017
rest = true
```
**comment out or remove the following line**
`#bind_ip = 127.0.0.1`

save changes to the file and exit

**start mongo**
`sudo service mongod start`

###Add user accounts to  mongo

**Enter the mongo shell**
`mongo localhost:<port number>`

**Upgrade auth schema**
```
use admin
db.getSiblingDB("admin").runCommand({authSchemaUpgrade: 1})
```
**Create admin account**
```
db.createUser({
    user: "<username>",
    pwd: "<password>",
    roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```
*Although there is a root user in 2.6, it doesn't provide access to collections that begin with the system. prefix.*

**Create a client account to access this database via the API**
```
-use dbPasture
-db.createUser({
    user: "<username>",
    pwd: "<password>",
    roles: [{ role: "readWrite", db: "<database_name>"}]
})
```

**Create a test client account to access the test database via the API**
```
-use dbPastureTest
-db.createUser({
    user: "<username>",
    pwd: "<password>",
    roles: [{ role: "readWrite", db: "<test_database_name>"}]
})
```

**After completing the previous steps, add the following line to the /etc/mongod.conf file**
`auth = true`

**Restart the mongod service:**
`sudo service mongod restart`

###Backup database
```
-sudo mongodump --port <port_number> -u <username> -p <password> --authenticationDatabase admin -db <database_name>
```
**The user account performing the backup should have the userAdmin role for the backup database**

###Restore database
mongorestore -u <admin_username> -p <admin_password> --authenticationDatabase admin -db <database_name> -v --port <port_number> <path_to_backup>
 
