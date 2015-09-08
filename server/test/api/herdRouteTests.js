/**
 * /herd Route Tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Mark Butler, Tim Molteno
 *
 **/
var supertest = require('supertest');
var api = supertest('https://localhost:8443');
var app = require('../../app');
var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));

describe('Herd Rest API', function(){

    var dataSource = require('../dataSource');
    before(function(){
        return login.loginAsync(api).then(function () {
            return dataSource.setup();
        });

    });

    describe('#get herds', function(){

        it('should get all herds', function() {

            return login.getAsync(api, '/api/herds').then(function (res) {
                res.statusCode.should.equal(200);
                should.exist(res.body);
                should.exist(res.body.herds);
                res.body.herds.should.not.be.empty;
            });
        });


        it('should contain correct json values', function(){

            return login.getAsync(api, '/api/herds').then(function (res) {
                res.statusCode.should.equal(200);
                should.exist(res.body);
                should.exist(res.body.herds);
                res.body.herds.should.not.be.empty;

                res.body.herds.should.all.have.property('id');
                res.body.herds.should.all.have.property('name');
                res.body.herds.should.all.have.property('farmId');
            });
        });

        it('should get all herds and include farms', function(){

            return login.getAsync(api, '/api/herds?include=farm').then(function (res) {
                res.statusCode.should.equal(200);
                should.exist(res.body);
                should.exist(res.body.herds);
                res.body.herds.should.not.be.empty;

                res.body.herds.should.all.have.property('farmId');
                res.body.herds.should.all.have.property('farm');
            });
        });
    });
});