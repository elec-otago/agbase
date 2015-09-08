/**
 * /paddock Route Tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Tim Miller, Tim Molteno
 *
 **/

//var orm = require('../../model');
var supertest = require('supertest');
var api = supertest('https://localhost:8443');
var app = require('../../app');

var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));

describe('Paddock Rest API', function(){

    var dataSource = require('../dataSource');
    before(function(){
        return login.loginAsync(api).then(function () {
            return dataSource.setup();
        });
    });

    describe('#get paddocks', function(){

        it('should get all paddocks', function(){

            return login.getAsync(api, '/api/spatial/paddocks').then(function (res) {

                if(res.statusCode !== 200) {
                    console.log("Error Response: " + res.text);
                }

                res.statusCode.should.equal(200);
                should.exist(res.body);
                should.exist(res.body.data);
            });
        });

        it('should check paddocks return in descending order', function() {

            return login.getAsync(api, '/api/spatial/paddocks').then(function (res) {

                res.statusCode.should.equal(200);

                var paddocks = res.body.data;
                    
                should.equal(paddocks.length > 1, true, "Test needs at least two paddocks to determine sort order\n");

                var highDate = new Date(paddocks[0].created);
                var lowDate = new Date(paddocks[ paddocks.length - 1].created);

                should.equal(highDate > lowDate, true, "paddocks failed to return in descending order "
                    + JSON.stringify(paddocks)
                );
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });
        });
    });

    describe('#create paddock', function(){

        var createdPaddock;

        it('should create a paddock', function(){

            var paddock = {
                    name: "Mocha Test Paddock",
                    farm_id: 7357,
                    loc: {
                        coordinates: [[
                            [0,0],[0,1],[1,1],[1,0],[0,0]
                        ]]
                    }
                };

            return login.postAsync(api, '/api/spatial/paddocks',paddock).then(function (res) {

                should.exist(res.body.data);
                createdPaddock = res.body.data;
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });      

        var testPaddockFirst;
        var testPaddockSecond;

        it('should return existing paddock when trying to create paddock with same name', function(){

            var paddock = {
                    name: "Test Paddock Name Test",
                    farm_id: 7357,
                    loc: {
                        coordinates: [[
                         [2,2],[2,3],[3,3],[3,2],[2,2]
                        ]]
                    }
                };
            
            return login.postAsync(api, '/api/spatial/paddocks',paddock)
                .then(function (res) {
                   
                    should.exist(res.body);                    
                    res.statusCode.should.equal(200);

                    testPaddockFirst = res.body.data;                    
                
                    return paddock;
                })
                .then(function(paddock) {
                    
                    return login.postAsync(api, '/api/spatial/paddocks', paddock);
                })
                .then(function(res) {
                    
                    should.exist(res.body);
                    res.statusCode.should.equal(200);
                    
                    testPaddockSecond = res.body.data;
                    
                    // Check that the first paddock was return from looking at the paddock ids.
                    should.equal(testPaddockFirst._id === testPaddockSecond._id, true,"Test failed to return first paddock");
                })
                .catch(function(err){
                    
                    console.log("error: " + err.message);
                });
        })

        after(function(){

            if(! testPaddockFirst){
                return;
            }

            return login.deleteAsync(api, '/api/spatial/paddocks/' + testPaddockFirst._id)
                .then(function(res) {

                    should.exist(res.body);
                    res.statusCode.should.equal(200);
                })
                .then(function() {
                    
                    if(! createdPaddock) {
                        return;
                    }
                    return login.deleteAsync(api, '/api/spatial/paddocks/' + createdPaddock._id)
                })
                .catch(function(err) {
                    
                    console.log("error: " + err.message);
                });
        });
    });
    
    describe('#fail create paddock', function(){        

        it('should fail to create a paddock with no name', function(){
            // NOTE: this paddock doesn't have a real farm id!!!
            var paddock = {                    
                    farm_id: 7357,
                    loc: {
                        coordinates: [[
                            [0,0],[0,1],[1,1],[1,0],[0,0]
                        ]]
                    }
                };
         
            return login.postAsync(api, '/api/spatial/paddocks/', paddock)
                .then(function(res){
                    
                    should.exist(res.body);
                    res.statusCode.should.equal(422);
                })
                .catch(function(err) {
                    console.log("error: " + err.message);
                });
        });
        it('should fail to create a paddock with no farm_id', function(){
            
            var paddock = {
                    name: "Mocha Test Paddock",
                    loc: {
                        coordinates: [[
                            [0,0],[0,1],[1,1],[1,0],[0,0]
                        ]]
                    }
                };
         
            return login.postAsync(api, '/api/spatial/paddocks/', paddock)
                .then(function(res) {

                    should.exist(res.body);
                    res.statusCode.should.equal(422);                     
                })
                .catch(function(err) {
                    console.log("error: " + err.message);
                });
            
        });
        it('should fail to create a paddock with no loc coordinates', function(){
            
            var paddock = {
                    name: "Mocha Test Paddock",
                    farm_id: 7357,
                    loc: {}
                };
         
            return login.postAsync(api, '/api/spatial/paddocks/', paddock)
                .then(function(res) {

                    should.exist(res.body);
                    res.statusCode.should.equal(422);
                })
                .catch(function(err) {
                    console.log("error: " + err.message);
                });
        });
    });
});
