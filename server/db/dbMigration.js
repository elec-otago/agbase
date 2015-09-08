/**
 * Database Migration
 *
 * Uses Umzug to handle making changes to the database
 *
 * For more info see https://github.com/sequelize/umzug
 *
 * Migration files live in migrations/
  *and should have file format xxxxxx-<taskname>-x.js
 * e.g. 0000001-measurementUpdate.js
 *
 * See migrations/example.js for an example migration file
 *
 * Copyright (c) 2015. Elec Research.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 *
 * Author: Mark Butler.
 *
 **/
var Umzug = require('umzug');
var forEachIn = require('./../utils/forEachIn');

var agbaseUmzug;


exports.setup = function(seqInstance){
    agbaseUmzug = new Umzug({
        storage: 'sequelize',
        storageOptions: {sequelize: seqInstance},
        logging: console.log,
        migrations: {
            // The path to the migrations directory.
            path: 'db/migrations',

            // The pattern that determines whether or not a file is a migration. xxxxxx-<taskname>-x.js
            pattern: /^\d+[\w-]+\.js$/,

            params: [seqInstance.getQueryInterface(), seqInstance.constructor, function() {
                throw new Error('Migration tried to use old style "done" callback. Please return a promise instead.');
            }]
        }
    });
};


exports.migrateIfRequired = function (){

    console.log("checking to see if db needs migration");

    return agbaseUmzug.pending().then(function (migrations) {

        if(migrations.length >0 ){
            console.log('pending Migrations:');
        }else{
            console.log('no pending migrations');
        }

        forEachIn(migrations, function(migration){

            console.log(migration.file);
        });

        //executes all pending migrations
        return agbaseUmzug.up();
    });
};