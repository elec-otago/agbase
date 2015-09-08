/**
 * db.js
 * Pulls setup of database, ORM and seeding together
 *
 * Copyright (c) 2014-2015. Elec Research.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 *
 * Authors: Mark Butler
 *
 **/

//define exports first to avoid issues with circular dependancies
var self = module.exports = {
};

var dbSeed = require('./dbSeed');
var dbMigration = require('./dbMigration');
var orm = require('./orm');
var Promise = require('./../wowPromise');
var forEach = require('./../utils/forEachIn');
var Transaction = require('./controllers/Transaction');

//database configuration
var dbName = 'wowdb';
var dbUser = 'pguser';
var dbPassword = 'pgwow';
var dbPort = 5432;
var dbHost = '127.0.0.1';

if(process.env.NODE_ENV === 'aws'){

    console.log("configure postgres for aws");
    dbName = "ebdb"; //todo: get dynamically
    dbHost  = process.env.RDS_HOSTNAME;
    dbUser  = process.env.RDS_USERNAME;
    dbPassword = process.env.RDS_PASSWORD;
    dbPort = process.env.RDS_PORT;

}else if (process.env.NODE_ENV === "unit_testing") {

    console.log("Configure postgres for Local Testing");

    dbName = 'wowdb_unittest';

}else{

    console.log("Configure postgress for local development");
}

console.log("Db name: " + dbName + ", host: " + dbHost + ", user: " + dbUser);

var sequelizeOptions = {

    host: dbHost,

    //custom port if needed default is 3306
    port: dbPort,

    //disable logging to console.log
    logging: process.env.SEQ_LOGGING ? console.log : false,

    //sql dialect of our database
    dialect: 'postgres',

    //use native library for postgres to allow ssl support
    //native: true,

    //connection pool settings
    pool: { maxConnections: 5, maxIdleTime: 30}

};

var isSettingUp = false;
var isSetup = false;
var seedData = null;
var setUpResolves = [];


self.setup = function () {

    if (isSetup) {
        return Promise.resolve();
    }

    var promise = new Promise(function(resolve, reject) {
        setUpResolves.push(resolve);
    });

    //This is to make the unit tests calling this function wait until the DB has been set up
     if (! isSettingUp) {

         console.log("Connecting ORM with Postgres...");

         isSettingUp = true;

         orm.setup(dbName, dbUser, dbPassword, sequelizeOptions).then(function() {

             dbMigration.setup(orm.sequelize);

             return dbMigration.migrateIfRequired();
         }).then(function(){

             console.log('Seeding...');
             return Transaction.begin(function(t) {
                 return dbSeed.seed();
             });
         }).then(function(resultingSeed){

             console.log('Seed done');
             self.seedData = resultingSeed;
             isSettingUp = false;
             isSetup = true;

            forEach(setUpResolves, function(resolve){
                resolve();
            });
         }).catch(function(err){

            console.log("Error setting up Database");
            console.log(err.stack);
         });

     }else{

         console.log("Someone is waiting for DB to set up...");
     }

    return promise;
};

self.getSeedData = function(){
    return seedData;
};



