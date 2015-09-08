/**
 * Database Seeds
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Tim Miller, Mark Butler, Tim Molteno
 *
 **/

var mongoose = require('mongoose');

var singleton = function singleton() {

    var dbName = "dbPasture";
    var url;
    var userOptions;

    if (process.env.NODE_ENV === "unit_testing") {
        dbName = 'dbPasture_unittest';

        console.log('using test mongo database: ' + dbName);
    }


    if (process.env.NODE_ENV === 'aws') {

        console.log("Mongo connecting to aws db in environment " + process.env.AWS_ENV);

        if (process.env.AWS_ENV === 'test') { //AWS_ENV = test or production

            console.log("Mongo configured for AWS Test environment");
            userOptions = {user: 'clientTest', pass: 'H1dd3n_P@ssw0rd'};
            dbName = "dbPastureTest";
        }
        else {
            console.log("Mongo configured for AWS Production environment");
            userOptions = {user: 'client', pass: 'H1dd3n_P@ssw0rd'};
        }

        url = "mongodb://52.10.101.151:8443/" + dbName;

    } else {

        console.log("Mongo connecting to local db");
        url = "mongodb://localhost:27017/" + dbName;

    }

    var isSettingUp = false;
    var isSetUp = false;

    this.setup = function (done) {
        if (isSetUp) {
          console.log('mongo already setup');
          done();
          return;
        }
        console.log('setting up mongo');

        //This is to make the unit tests calling this function wait until the DB has been set up
        if (isSettingUp) {

            console.log("Someone is waiting for Mongo DB to set up...");

            var flagCheck = setInterval(function () {
                if (! this.isSettingUp) {
                    clearInterval(flagCheck);
                    done();
                }
            }, 100); // interval set at 100 milliseconds

            return;
        }

        isSettingUp = true;

        mongoose.connect(url, userOptions);
        
        this.db = mongoose.connection;

        this.db.on('error', function (err) {

            console.error('MongoDB connection error:');
            console.error(err);

            if (isSettingUp) {
                isSettingUp = false;
                isSetUp = false;
                done();
            }
        });

        this.db.once('open', function (callback) {

            console.log('MongoDB connected');
            isSetUp = true;
            if (isSettingUp) {
                isSettingUp = false;
                done();
            }
        });
    };

    if(singleton.caller !== singleton.getInstance){
        throw new Error("This object cannot be instantiated");
    }
};


singleton.instance = null;

singleton.getInstance = function(){

    if(this.instance === null){
        this.instance = new singleton();
    }

    return this.instance;
};

module.exports = singleton.getInstance();

