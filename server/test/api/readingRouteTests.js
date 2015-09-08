/**
 * /pasture measurement Route Tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Tim Miller, Mark Butler
 *
 **/

var supertest = require('supertest');
var api = supertest('https://localhost:8443');

var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));

describe('Pasture Measurements Rest API', function(){

    
    
    describe('#get Readings', function(){  
       
        it('should get all readings', function(){ 

            login.getAsync(api, '/api/spatial/readings').then(function(res){

                res.statusCode.should.equal(200);
                should.exist(res.body);
                should.exist(res.body.data);
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });            
        });

        it('should check readings return in descending order', function() {

            login.getAsync(api, '/api/spatial/readings').then(function(res){

                res.statusCode.should.equal(200);                  
                should.exist(res.body.data);
                
                var readings = res.body.data;

                should.equal(readings.length > 1, true, "Test needs at least two pasture measurements to determine sort order");

                var highDate = new Date(readings[0].created);
                var lowDate = new Date(readings[ readings.length -1 ].created);

                should.equal(highDate > lowDate, true, "pasture measurements failed to return in descending order");
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            }); 
        });
    }); 
    
    describe('#create Reading', function() {
        
        var createdReading;
        
        it('should create a reading', function() {
        
            var reading = {
                    length: 1,
                    location: [50, 50],
                    paddock_oid: "fakepaddockoid",
                    altitude: 1
            };
            
            login.postAsync(api, '/api/spatial/readings', reading).then(function(res){
                
                res.statusCode.should.equal(200);
                should.exist(res.body.data);                    
                
                createdReading = res.body.data;
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });        
        });       
    });
    
    describe('#fail create Reading', function() {
       
        it('should fail to create reading when length not included', function() {
            
            var reading = {                   
                    location: [50, 50],
                    paddock_oid: "fakepaddockoid",
                    altitude: 1                
            };
            
            login.postAsync(api, '/api/spatial/readings', reading).then(function(res) {
                
                should.exist(res.body);
                res.statusCode.should.equal(422);
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
            
        });
        it('should fail to create reading when location not included', function() {
            
            var reading = {
                    length: 1,
                    paddock_oid: "fakepaddockoid",
                    altitude: 1
            };
            
            login.postAsync(api, '/api/spatial/readings', reading).then(function(res) {

                should.exist(res.body);
                res.statusCode.should.equal(422);            
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });
        it('should fail to create reading when paddock id is not included', function() {
            
            var reading = {
                    length: 1,
                    location: [50, 50],
                    altitude: 1
            };
            
            login.postAsync(api, '/api/spatial/readings', reading).then(function(res) {

                should.exist(res.body);
                res.statusCode.should.equal(422);
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });
        it('should fail to create reading when location coordinates length != 2', function() {
            
            var reading = {
                    length: 1,
                    location: [50, 50, 1],
                    paddock_oid: "fakepaddockoid",
                    altitude: 1
            };
            
            login.postAsync(api, '/api/spatial/readings', reading).then(function(res) {

                should.exist(res.body);
                res.statusCode.should.equal(422);
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });
    });   
});
