/**
 * /weather measurement Route Tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller
 *
 **/
var supertest = require('supertest');
var api = supertest('https://localhost:8443');

var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));

describe('Weather Measurements Rest API', function() {

    var dataSource = require('../dataSource');
    before(function(){
        return login.loginAsync(api).then(function () {
            return dataSource.setup();
        });
    });

    describe('#post Weather Measurements', function() {
        
        it('should create a new weather measurement', function() {

            var postWeather = {                                
                    farm_id: 1,
                    temperature: 25,
                    location: [10, 10],
                    altitude: 2,
                    created: new Date()                
            };

            login.postAsync(api,'/api/spatial/weather', postWeather).then(function(res) { 

                res.statusCode.should.equal(200);
                should.exist(res.body.data);
                var resWeather = res.body.data;
               
                // test returned weather measurement against posted weather measurement.                                    
                should.equal(postWeather.farm_id, resWeather.farm_id, 
                    "New Weather Measurement's farm id doesn't match posted");
                should.equal(postWeather.temperature, resWeather.temperature, 
                    "New Weather Measurement's temperature doesn't match posted");
                should.equal(postWeather.location[0], resWeather.location[0], 
                    "New Weather Measurement's longitude doesn't match posted");
                should.equal(postWeather.location[1], resWeather.location[1], 
                    "New Weather Measurement's latitude doesn't match posted");
                should.equal(postWeather.altitude, resWeather.altitude, 
                    "New Weather Measurement's altitude doesn't match posted");
                should.equal(new Date(postWeather.created).getTime(), new Date(resWeather.created).getTime(), 
                    "New Weather Measurement's created doesn't match posted");

                // test return message
                should.equal(res.body.message, "Weather Data Saved", "Unexpected message: " + res.body.message);
               
                return resWeather;
                
            })
            .then(function(weatherReading){
                
                return login.deleteAsync(api, '/api/spatial/weather/' + weatherReading._id);
            })
            .catch(function(err) {
               console.log("error: " + err.message); 
            });
              
        });

        it('should reject a measurement without a farm_id', function() {

            var postWeather = {
                    temperature: 25,
                    location: [10, 10],
                    altitude: 2,
                    created: new Date()                
            };
            login.postAsync(api, '/api/spatial/weather', postWeather).then(function(res) {

                should.exist(res);
                res.statusCode.should.equal(422);

                should.exist(res.body.error);
                should.equal(res.body.error, "A farm id must be provided", 
                    "Unexpected message: " + res.body.error);
            })
            .catch(function(err) {
                console.log("error: " + err.message);
            });
        });
       
        it('should reject a measurement without a location', function() {

            var postWeather = {          
                    farm_id: 1,
                    temperature: 25,
                    altitude: 2,
                    created: new Date()
            };
            login.postAsync(api, '/api/spatial/weather', postWeather).then(function(res) {               

                should.exist(res);
                res.statusCode.should.equal(422);

                should.exist(res.body.error);
                should.equal(res.body.error, "Location coordinates must be provided", 
                    "Unexpected message: " + res.body.error);
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });
        });
        
        it('should reject a measurement with a single location value', function() {

            var postWeather = {        
                    farm_id: 1,
                    temperature: 25,
                    location: [10],
                    altitude: 2,
                    created: new Date()
            };
            
            login.postAsync(api, 'spatial/weather', postWeather).then(function(res) {               

                should.exist(res);
                res.statusCode.should.equal(422);

                should.exist(res.body.error);
                should.equal(res.body.error, "Location coordinates must contain only longitude and latitude values", 
                    "Unexpected message: "  + res.body.error);
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });
        });
        it('should reject a measurement with 3 location values', function() {

            var postWeather = {      
                    farm_id: 1,
                    temperature: 25,
                    location: [1, 2, 3],
                    altitude: 2,
                    created: new Date()
            };

            login.postAsync(api, '/api/spatial/weather', postWeather).then(function(res) {               

                should.exist(res);
                res.statusCode.should.equal(422);

                should.exist(res.body.error);
                should.equal(res.body.error, "Location coordinates must contain only longitude and latitude values", 
                    "Unexpected message: " + res.body.error);
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });
        });
        it('should reject a measurement with an invalid longitude value', function() {

            var postWeather = {          
                    farm_id: 1,
                    temperature: 25,
                    location: [999, 10],
                    altitude: 2,
                    created: new Date()
            };

            login.postAsync(api, '/api/spatial/weather', postWeather).then(function(res) {               

                should.exist(res);
                res.statusCode.should.equal(422);

                should.exist(res.body.error);
                should.equal(res.body.error, "Location coordinates must not be outside longitude bounds", 
                    "Unexpected message: " + res.body.error);
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });
        });
        it('should reject a measurement with an invalid latitude value', function() {

            var postWeather = {            
                    farm_id: 1,
                    temperature: 25,
                    location: [10, 999],
                    altitude: 2,
                    created: new Date()
            };
            
            login.postAsync(api,'/api/spatial/weather', postWeather).then(function(res) {               

                should.exist(res);
                res.statusCode.should.equal(422);

                should.exist(res.body.error);
                should.equal(res.body.error, "Location coordinates must not be outside latitude bounds", 
                    "Unexpected message: " + res.body.error);
            })
            .catch(function(err) {
                console.log('error: ' + err.message);
            });
        });       
    });

    describe('#get Weather Measurements', function() {

        var date1 = new Date('2015-05-10');
        var date2 = new Date('2015-05-12');

        var weatherReading1 = { 
                farm_id: -1,
                temperature: 25,
                location: [10, 10],
                altitude: 2,
                created: date1
        };

        var weatherReading2 = { 
                farm_id: -1,
                temperature: 20,
                location: [10, 10],
                altitude: 2,
                created: date1
        };

        var weatherReading3 = {
                farm_id: -2,
                temperature: 12,
                location: [ 1, -1],
                altitude: 8,
                created: date2
        };


        var weatherReading4 = { 
                farm_id: -2,
                temperature: 13,
                location: [1, -1],
                altitude: 8,
                created: date2
        };
        //TODO: add to dataSource
        before(function() {
            // make weather measurements for test purposes
            login.postAsync(api, '/api/spatial/weather', weatherReading1)
            .then(function(res) {

                weatherReading1._id = res.body.data._id;
                return login.postAsync(api, '/api/spatial/weather', weatherReading2);
            })
            .then(function(res) {

                weatherReading2._id = res.body.data._id;
                return login.postAsync(api, '/api/spatial/weather', weatherReading3);
            })
            .then(function(res) {

                weatherReading3._id = res.body.data._id;
                return getAPI.post(api, '/api/spatial/weather', weatherReading4);
            })
            .then(function(res) {

                weatherReading4._id = res.body.data._id;
            })
            .catch(function(err){
                
                console.log('error setting up get weather measurement tests');
                console.log('error: ' + err.message);
            });
        });

        it('gets a weather measurement by id', function() {
            
            login.getAsync(api,'/api/spatial/weather?id=' + weatherReading1._id).then(function(res) {

                res.statusCode.should.equal(200);
                should.exist(res.body.data);

                var resReading = res.body.data[0];

                should.equal(resReading._id, weatherReading1._id, 
                    "Get weather measurement's id does not match query id");
                should.equal(resReading.temperature, weatherReading1.temperature, 
                    "Get weather measurement's temperature does not match that of posted weather measurement");
                should.equal(resReading.location[0], weatherReading1.location[0],
                    "Get weather measurement's longitude does not match that of posted weather measurement");
                should.equal(resReading.location[1], weatherReading1.location[1],
                    "Get weather measurement's latitude does not match that of posted weather measurement");
                should.equal(resReading.altitude, weatherReading1.altitude,
                    "Get weather measurement's altitude does not match that of posted weather measurement");
                should.equal(new Date(resReading.created).getTime(), new Date(weatherReading1.created).getTime(),
                    "Get weather measurement's created does not match that of posted weather measurement");
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });

        it('gets all weather measurements', function() {

            login.getAsync(api, '/api/spatial/weather').then(function(res) {               

                res.statusCode.should.equal(200);
                should.exist(res.body.data);
                
                var weatherReadings = res.body.data;

                should.ok(weatherReadings.length >= 4, "Get weather measurements did not return all weather measurements");
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });

        it('gets weather measurements for a particular farm', function() {

            login.getAsync(api, '/api/spatial/weather?farm_id=-1').then(function(res) {

                res.statusCode.should.equal(200);
                should.exist(res.body.data);
                
                var weatherReadings = res.body.data;
                var correctResult = weatherReadings.length >= 2;
                 
                // check that the request only returned weather measurements for the
                // correct farm.
                if(correctResult) {                    
                    weatherReadings.forEach(function(reading) {
                        if(reading.farm_id != -1) {
                            correctResult = false;
                        }
                    });
                }
                should.equal(correctResult, true,
                     "Get weather measurements by farm id did not return correct result");
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });

        it('gets all weather measurements after a given date', function() {
    
            var startDateStr = '2015-05-11';
            var startDate = new Date(startDateStr).toISOString();

            login.getAsync(api, '/api/spatial/weather?start_date=' + startDateStr).then(function(res) {

                res.statusCode.should.equal(200);
                should.exist(res.body.data);

                var weatherReadings = res.body.data;
                var correctResult = weatherReadings.length >= 2;

                if(correctResult) {
                    weatherReadings.forEach(function(reading) {
                        
                        var readingDate = new Date(reading.created);
                    
                        if(readingDate.getTime() < startDate.getTime()) {
                            correctResult = false;       
                        }
                    });
                }

                should.equal(correctResult, true,
                    "Get weather measurements after start date did not return correct result");
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });

        it('gets all weather measurements before a given date', function() {

            var endDateStr = '2015-05-11';
            var endDate = new Date(endDateStr).toISOString();

            login.getAsync(api,'/api/spatial/weather?end_date=' + endDateStr).then(function(res) {

                res.statusCode.should.equal(200);
                should.exist(res.body.data);
                
                var weatherReadings = res.body.data;
                var correctResult = weatherReadings.length >= 2;

                if(correctResult) {
                    weatherReadings.forEach(function(reading) {
                        
                        var readingDate = new Date(reading.created);
                    
                        if(readingDate.getTime() > endDate.getTime()) {
                            correctResult = false;       
                        }
                    });
                }

                should.equal(correctResult, true,
                    "Get weather measurements before end date did not return correct result");
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });

        it('gets all weather measurements between two dates', function() {

            var startDateStr = '2015-05-11';
            var startDate = new Date(startDateStr).toISOString();

            var endDateStr = '2015-05-13';
            var endDate = new Date(endDateStr).toISOString();

            login.getAsync('spatial/weather?start_date=' + startDateStr + "&end_date=" + endDateStr)
            .then(function(res) {

                res.statusCode.should.equal(200);
                should.exist(res.body.data);

                var weatherReadings = res.body.data;
                var correctResult = weatherReadings.length >= 2;

                should.equal(correctResult, true,
                    "Get weather measurements between dates did not return correct result\n" + JSON.stringify(weatherReadings));

                if(correctResult) {
                    weatherReadings.forEach(function(reading) {
                        
                        var readingDate = new Date(reading.created);
                    
                        if(readingDate.getTime() < startDate.getTime() ||
                            readingDate.getTime() > endDate.getTime()) {
                            correctResult = false;       
                        }
                    });
                }
                should.equal(correctResult, true,
                    "Get weather measurements between dates did not return correct result");
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });
        
        //TODO: remove in dataSource?
        after(function() {
            // delete weather measurements from before
            login.deleteAsync(api, '/api/spatial/weather/' + weatherReading1._id).then(function(res) {
                
                return login.deleteAsync(api, '/api/spatial/weather/' + weatherReading2._id);
            })
            .then(function(res) {
                
                return login.deleteAsync(api, '/api/spatial/weather/' + weatherReading3._id);
            })
            .then(function(res) {
                
                return login.deleteAsync(api, '/api/spatial/weather/' + weatherReading4._id);
            })
            .catch(function(err) {
     
                console.log('failed to remove test data from weather route get tests');
                console.log('error: ' + err.messsage);
            });
        });
    });


    describe('#put Weather Measurements', function() {
        
        var weatherReading5 = { 
                farm_id: 800,
                temperature: -1,
                location: [0, -90],
                altitude: 12,
                created: new Date()
        };
                
        var updatedWeatherReading5 = {
                farm_id: 800,
                temperature: -100,
                location: [0, -90],
                altitude: 1,
                created: new Date()
        };        
        
        //TODO add to dataSource
        before(function() {
            
            login.postAsync(api, '/api/spatial/weather', weatherReading5).then(function(res) {
                
                weatherReading5._id = res.body.data._id;
                updatedWeatherReading5._id = weatherReading5._id;                
            })
            .catch(function(err) {
                console.log('failed to setup put weather measurements route test data');
                console.log('error: ' + err.message);
            });
        });
        
        it('should update a weather reading', function() {
            
            login.putAsync(api, '/api/spatial/weather/' + weatherReading5._id, updatedWeatherReading5)
            .then(function(res) {
                
                res.statusCode.should.equal(200);
                should.exist(res.body.data);
                
                var resReading = res.body.data;
                var reading = updatedWeatherReading5;
                
                should.equal(resReading.temperature, reading.temperature, 
                    "Temperature of updated weather reading doesn't match submitted temperature");
                should.equal(resReading.altitude, reading.altitude,
                    "Altitude of updated weather reading doesn't match submitted altitude");
                should.equal(res.body.message, "Updated Weather Data",
                    "Unexpected message: " + res.body.message);
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });
        //TODO: remove in dataSource?
        after(function() {

            login.deleteAsync(api, '/api/spatial/weather/' + weatherReading5._id).catch(function(err) {
                
                console.log('failed to remove put weather measurements route test data');
                console.log('error: ' + err.message);
            });                    
        });
    });

    describe('#delete Weather Measurements', function() {

        var weatherReading6 = { 
                farm_id: 3,
                temperature: 30,
                location: [1.29045, 13],
                altitude: 12,
                created: new Date()
        };
        // TODO: add in dataSource?
        before(function() {

            login.postAsync(api, '/api/spatial/weather', weatherReading6).then(function(res) {
                
                res.statusCode.should.equal(200);
                should.exist(res.body.data);
                weatherReading6._id = res.body.data._id;               
            })
            .catch(function(err) {
                
                console.log('failed to setup delete weather measurements route test data');
                console.log('error: ' + err.message);
            });
        });
        it('tests delete by id', function() {

            login.deleteAsync(api, '/api/spatial/weather/' + weatherReading6._id).then(function(res) {

                should.exist(res);
                res.statusCode.should.equal(200);
                should.equal(res.body.message, "Deleted Weather Data", 
                    "Unexpected message: " + res.body.message);
            })
            .catch(function(err) {
                
                console.log('error: ' + err.message);
            });
        });
    });
});
