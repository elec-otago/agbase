/**
 * AgBase: Pasture Measurement Service Test
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller.
 *
 **/


//TODO add tests for count
describe('PastureMeasurementService', function() {

    var PastureMeasurementService;
    var httpBackend;
    var pastureMeasurementAPI = new FakeAPI();    
    
    beforeAll(function() {
       pastureMeasurementAPI.init();
    });    
    
    beforeEach(function() {
        
        angular.mock.module('ngMoogle');
        
        inject(function(_PastureMeasurementService_, $httpBackend) {
        
            PastureMeasurementService = _PastureMeasurementService_;
            httpBackend = $httpBackend;            
        });
    });
    
    afterEach(function() {
       
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
    
    afterEach(function() {
        
        httpBackend.flush();
    });
    it('should test PastureMeasurementService.find returns\n' +
    ' correct measurements when given only a paddock id', 
    function() {
        
        var paddockId = pastureMeasurementAPI.paddock1Id;
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?paddock=" + paddockId)
        .respond(pastureMeasurementAPI.request('GET', null, {paddock: paddockId}));

        PastureMeasurementService.find(paddockId, null, null, null, function(err, result) {            
            
            result.forEach(function(measurement) {
                // check only measurements for the expected paddock where returned.                
                expect(measurement.paddock_id).toEqual(paddockId);
            });
        });
    });
    
    it('should test PastureMeasurementService.find returns\n' +
    ' correct measurements when given both a paddock and algorithm id',
    function() {
     
        var paddockId = pastureMeasurementAPI.paddock2Id;
        var algorithmId = 1;
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?algorithm_id=" + algorithmId + "&paddock=" + paddockId)
        .respond(pastureMeasurementAPI.request('GET', null, {paddock: paddockId, algorithm_id: algorithmId}));
        
        PastureMeasurementService.find(paddockId, algorithmId, null, null, function(err, res) {
           
            var measurements = res;
            
            measurements.forEach(function(measurement) {
               
                expect(measurement.paddock_id).toEqual(paddockId);
                expect(measurement.algorithm_id).toEqual(algorithmId);
            });
        });
    });
    
    it('should test PastureMeasurementService.findByTimespan returns\n' +
    ' pasture measurements taken before the given end date', 
    function() {
            
        var endDate = pastureMeasurementAPI.measurementDates[2];
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?end_date=" + endDate + "&limit=1023")
        .respond(pastureMeasurementAPI.request('GET', null, {end_date: endDate}));
        
        PastureMeasurementService.findByTimespan(null, null, null, endDate, null, null)
        .then(
        function(result) {
            
            var endTime = new Date(endDate).getTime();            
            //var measurements = result.data;

            result.forEach(function(measurement) {
               
                measurementTime = new Date(measurement.created).getTime();
               
                expect(measurementTime < endTime).toBe(true);
            });       
        },
        function(error) {   
            assert(true, false, "findByTimespan service returned an error!");// force fail
        });
    });
    
    it('should test PastureMeasurementService.findByTimespan returns\n' +
    ' pasture measurements taken after the given start date', 
    function() {
            
        var startDate = pastureMeasurementAPI.measurementDates[0];
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?limit=1023&start_date=" + startDate)
        .respond(pastureMeasurementAPI.request('GET', null, {start_date: startDate}));
        
        PastureMeasurementService.findByTimespan(null, null, startDate, null, null, null)
        .then(
        function(result) {
           
            var startTime  = new Date(startDate).getTime();
           // var measurements = result.data;
            
            result.forEach(function(measurement) {
               
                measurementTime = new Date(measurement.created).getTime();
                
                expect(measurementTime > startTime).toBe(true);
            });
        },
        function(error) {   
            assert(true, false, "findByTimespan service returned an error!");// force fail
        });
    });
    
    it('should test PastureMeasurementService.findByTimespan returns\n' +
    ' pasture measurements between the given start and end dates', 
    function() {
           
        var startDate = pastureMeasurementAPI.measurementDates[0];
        var endDate = pastureMeasurementAPI.measurementDates[2];
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?end_date=" + endDate + "&limit=1023&start_date=" + startDate)
        .respond(pastureMeasurementAPI.request('GET', null, {start_date: startDate, end_date: endDate}));
        
        PastureMeasurementService.findByTimespan(null, null, startDate, endDate, null, null)
        .then(
        function(result) {

            var startTime = new Date(startDate).getTime();
            var endTime = new Date(endDate).getTime();

            result.forEach(function(measurement) {
               
                measurementTime = new Date(measurement.created).getTime();
                
                expect(measurementTime > startTime).toBe(true);
                expect(measurementTime < endTime).toBe(true);
            });
        },
        function(error) {   
            assert(true, false, "findByTimespan service returned an error!");// force fail
        });    
    });
    
    it('should test PastureMeasurementService.create successfully creates\n' +
    ' a new pasture measurement', 
    function() {
            
        var newPastureMeasurement = pastureMeasurementAPI.pastureMeasurementGenerator(
            pastureMeasurementAPI.generateRandomId(), [4, 4], 10, 1, new Date().toISOString() );
        
        httpBackend
        .whenPOST(pastureMeasurementAPI.route)
        .respond(pastureMeasurementAPI.request('POST', newPastureMeasurement, null));
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?paddock=" + newPastureMeasurement.paddock_oid)
        .respond(pastureMeasurementAPI.request('GET', null, {paddock: newPastureMeasurement.paddock_oid}));
        
        PastureMeasurementService.create(newPastureMeasurement.length, newPastureMeasurement.paddock_oid,
            newPastureMeasurement.location, null, newPastureMeasurement.created)
        .then(
        function(result) {        
            //test response here...
            expect(result.message).toEqual("Pasture Measurement Saved");
                
            // perform get request to check if saved
            PastureMeasurementService.find(newPastureMeasurement.paddock_oid, null, null, null, function(err, res) {  
                
                expect(res.length).toEqual(1); // should only be 1 pasture measurement
                expect(res[0].paddock_id).toEqual(newPastureMeasurement.paddock_oid);
            });
        },
        function(error){
            assert(true, false, "findByTimespan service returned an error!");// force fail
        });
    });
    
    it('should test PastureMeasurementService.remove successfully removes\n' +
       ' a pasture measurement', function() {
            
        var deleteMeasurementId = pastureMeasurementAPI.pastureMeasurementDb[0]._id;
        var deleteMeasurementPaddock = pastureMeasurementAPI.pastureMeasurementDb[0].paddock_oid;
        
        httpBackend
        .whenDELETE(pastureMeasurementAPI.route + deleteMeasurementId)
        .respond(pastureMeasurementAPI.request('DELETE', null, {object_id: deleteMeasurementId}));
        
        httpBackend
        .whenGET(pastureMeasurementAPI.route + "?paddock=" + deleteMeasurementPaddock)
        .respond(pastureMeasurementAPI.request('GET', null, {paddock: deleteMeasurementPaddock}));
        
        PastureMeasurementService.remove(deleteMeasurementId, function(res) {
           
            // test response here...
            expect(res.message).toEqual("Pasture Measurement Deleted");
            
            // perform request to confirm measurement was deleted
            PastureMeasurementService.find(deleteMeasurementPaddock, null, null, null, function(err, res) {
               
                var measurements = res;
                
                measurements.forEach(function(measurement) {
                   
                    var isDeleted = measurement._id === deleteMeasurementId;
                    
                    expect(isDeleted).toBe(false);
                });
            });            
        });
    });

    function FakeAPI() {
        
        this.route = "https://localhost:9018/api/spatial/readings/";        
        this.pastureMeasurementDb = [];
        this.measurementDates = [
            new Date("2010-01-01").toISOString(),
            new Date("2011-02-02").toISOString(),
            new Date("2012-01-01").toISOString()
        ];
        this.paddock1Center = [1, 1];
        this.paddock2Center = [2, 2];
        this.paddock3Center = [3, 3];
    }
    
    FakeAPI.prototype.init = function() {
               
        this.paddock1Id = this.generateRandomId();        
        this.paddock2Id = this.generateRandomId();
        this.paddock3Id = this.generateRandomId();
        this.pastureMeasurementDb = this.createPastureMeasurementDb(); 
    };
           
    FakeAPI.prototype.pastureMeasurementGenerator = function(paddockId, paddockCenter, maxMeasurement, algoId, timeStamp) {
          
        var lonPos = paddockCenter[0] + (Math.random() - 0.5);
        var latPos = paddockCenter[1] + (Math.random() - 0.5);

        var measurementLength = Math.floor(Math.random() * maxMeasurement + 1);
            
        var pastureMeasurement =  {
            length: measurementLength,
            paddock_oid: paddockId,
            algorithm_id: algoId,
            created: timeStamp,
            updated: timeStamp,
            location: [lonPos, latPos],
            _id: this.generateRandomId()
        };
        return pastureMeasurement;
    };

    FakeAPI.prototype.createPastureMeasurementDb = function() {
        
        var db = [];
            
        var maxPastureMeasurement = 10;
        var measurementsPerSession = 10;
                
        // iterate through each session measurement
        for(var m = 0; m < measurementsPerSession; m++) {
                
            // iterate through each measurement date/algorithm id
            for(var d = 0; d < this.measurementDates.length; d++) {
                
                // create paddock 1 pasture measurement
                db.push(this.pastureMeasurementGenerator(
                    this.paddock1Id, 
                    this.paddock1Center, 
                    maxPastureMeasurement,
                    d,
                    this.measurementDates[d]));
                    
                // create paddock 2 pasture measurement
                db.push(this.pastureMeasurementGenerator(
                    this.paddock2Id,
                    this.paddock2Center,
                    maxPastureMeasurement,
                    d,                        
                    this.measurementDates[d]));
                    
                // create paddock 3 pasture measurement
                db.push(this.pastureMeasurementGenerator(
                    this.paddock3Id,
                    this.paddock3Center,
                    maxPastureMeasurement,
                    d,
                    this.measurementDates[d]));
            }
        }
        return db;
    };
    
    FakeAPI.prototype.generateRandomId = function() {
   
        var id = "";
        var possible = "abcdef0123456789";

        for(var i = 0; i < 24; i++) {
            
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return id;
    };
        
    FakeAPI.prototype.request = function(httpVerb, reqBody, reqParams) {
        
        var res = {};

        switch(httpVerb) {
          
            case 'GET':                
                res = this.get(reqParams);
                break;
                
            case 'POST':
                res = this.post(reqBody);
                break;

            case 'PUT':
                res = this.put(reqParams, reqBody);
                break;
                
            case 'DELETE':
                res = this.remove(reqParams);
                break;
                
            default:
                break;
        }
        return res;
    };
    
    FakeAPI.prototype.post = function(reqBody) {
        
        this.pastureMeasurementDb.push(reqBody); 
        
        var res = {
            message: "Pasture Measurement Saved",
            measurement: reqBody
        };

        return res;
    };
    
    FakeAPI.prototype.get = function(reqParams) {
        
        var res = {
            measurements: []
        };
        
        // convert paddock in reqParams into an array
        if(reqParams.paddock) {
            reqParams.paddock = [reqParams.paddock];
        }

        var queryParams = Object.keys(reqParams).length;
                
        // iterate through each pasture measurement
        this.pastureMeasurementDb.forEach(function(measurement) {

            var measurementTime = new Date(measurement.created).getTime();
            var queryMatches = 0;
            
            // iterate through each request parameter
            for(var param in reqParams) {
                if(reqParams.hasOwnProperty(param)) { // filter out base object properties

                    switch (param) {
                     
                        case "paddock":                            
                            // iterate through each paddock
                            for(var i = 0; i < reqParams.paddock.length; i++) {
                                                                
                                if(measurement.paddock_oid === reqParams.paddock[i]) {                                
                                    queryMatches++;
                                }
                            }
                            break;
                            
                        case "start_date":
                            
                            var startTime = new Date(reqParams.start_date).getTime();                            
                            
                            if(startTime < measurementTime) {
                                queryMatches++;
                            }                            
                            break;
                            
                        case "end_date":
                                                        
                            var endTime = new Date(reqParams.end_date).getTime();
                            
                            if(endTime > measurementTime) {
                                queryMatches++;
                            }                            
                            break;
                            
                        case "algorithm_id":
                            if(reqParams['algorithm_id'] === measurement['algorithm_id']) {
                                queryMatches++;
                            }                            
                            break;
                    }
                }
            }
            
            if(queryParams === queryMatches) {
                res.measurements.push(measurement);
            }
        });
        return res;
    };

    FakeAPI.prototype.put = function(reqParams, reqBody) {

        var res = {};

        return res;
    };

    FakeAPI.prototype.remove = function(reqParams) {

        var res = {message: "Pasture Measurement not found"};
        
        var deleteId = reqParams.object_id;
        
        for(var i = 0; i < this.pastureMeasurementDb.length; i++) {         
            if(this.pastureMeasurementDb[i]._id === deleteId) {
                this.pastureMeasurementDb.splice(i, 1);
                res.message = "Pasture Measurement Deleted";
            }
        }
        return res;
    };
});