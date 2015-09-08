/**
 * AgBase: Paddock Service Test
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

describe('PaddockService', function() {

    var PaddockService;
    var httpBackend;
    var paddockAPI = new FakeAPI();
       
    beforeEach(function() {
        
        angular.mock.module('ngMoogle');
        
        inject(function(_PaddockService_, $httpBackend) {

            PaddockService = _PaddockService_;            
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

    it('should test find works correctly when given 1 farm id as a param', function() {
        
        httpBackend
        .whenGET("https://localhost:9018/api/spatial/paddocks/?farm_id=1")
        .respond(paddockAPI.request('GET', null, {farm_id: 1}));
        
        PaddockService.find(1, function(err, paddocks) {
                       
            paddocks.forEach(function(paddock) {               
                
                expect(paddock.farm_id).toEqual(1);
            });
        });
    });
    it('should test findAll works correctly', function() {

        httpBackend
        .whenGET("https://localhost:9018/api/spatial/paddocks/?include=farm&limit=1000")
        .respond(paddockAPI.request('GET', null, {include: "farm"}));
        
        PaddockService.findAll(true, function(err, paddocks) {
           
            paddocks.forEach(function(paddock) {
               
                expect(paddock.farm_id).toEqual(paddock.farm.id);
            });
        });
    });

    it('should test create works correctly', function() {
        
        // The structure of the paddock that the service submits to the API
        var apiPostPaddock = {           
            name: "new paddock",
            farm_id: 3,            
            loc: {
                coordinates: [
                    [
                        [71.10107421875, -4.61672394843222],
                        [70.26611328125, -4.1709100968703],
                        [71.97998046875, -4.29685697148883],
                        [71.10107421875, -4.61672394843222]
                    ]
                ]                
            }
        };
     
        // the structure of the paddock we expect returned from the paddock service
        var serviceRetPaddock = {           
            name: "new paddock",
            farm_id: 3,            
            loc: [
                {latitude: -4.61672394843222,longitude: 71.10107421875},
                {latitude: -4.1709100968703, longitude: 70.26611328125},
                {latitude: -4.29685697148883,longitude: 71.97998046875}]
        };
        
        //details of paddock we are creating
        var newPaddockName = "new paddock";
        var newPaddockFarmId = 3;
        
        var newPaddockCoords = [
            {latitude: -4.61672394843222,longitude: 71.10107421875},
            {latitude: -4.1709100968703, longitude: 70.26611328125},
            {latitude: -4.29685697148883,longitude: 71.97998046875}];
        
        httpBackend
        .whenPOST("https://localhost:9018/api/spatial/paddocks/")
        .respond(paddockAPI.request('POST', apiPostPaddock, null));

        PaddockService.create(
            newPaddockName, 
            newPaddockFarmId, 
            newPaddockCoords,
            function(err, res){
                
                var postedPaddock = res;
                
                expect(postedPaddock.name).toEqual(serviceRetPaddock.name);
                expect(postedPaddock.farm_id).toEqual(serviceRetPaddock.farm_id);
               
                // compare location coordinates.
                for(var i = 0; i < postedPaddock.loc.length; i++) {
                    
                    expect(postedPaddock.loc[i].latitude)
                    .toEqual(serviceRetPaddock.loc[i].latitude);
                    
                    expect(postedPaddock.loc[i].longitude)
                    .toEqual(serviceRetPaddock.loc[i].longitude);
                }
            });
    });
    
    it('should test update works correctly', function() {
        
        var paddockUpdate = {
            _id: "556cf4e8e08f4b8e72238423",
            name: "Paddock 5 updated",
            loc: [
                {longitude: 171.10107421875, latitude: -43.61672394843222},
                {longitude: 170.26611328125, latitude: -44.1709100968703},
                {longitude: 171.97998046875, latitude: -44.29685697148883}
            ]
        };
        
        httpBackend
        .whenPUT("https://localhost:9018/api/spatial/paddocks/556cf4e8e08f4b8e72238423")
        .respond(paddockAPI.request('PUT', paddockUpdate, {paddock_oid: "556cf4e8e08f4b8e72238423"}));
        
        httpBackend                                                     // service will only return 
        .whenGET("https://localhost:9018/api/spatial/paddocks/?farm_id=3")  // paddocks that belong to a
        .respond(paddockAPI.request('GET', null, {farm_id: 3}));        // particular farm, so I use
                                                                        // a farm that only contains 1 
                                                                        // paddock for this test.
        PaddockService.update(paddockUpdate, function(err, res) {

            expect(res.message).toEqual("Paddock Updated");
            
            PaddockService.find(3, function(err, res) {
            
                var paddock = res[0];
                expect(paddock.name).toEqual(paddockUpdate.name);
            });
        });
    });
    
    it('should test remove works correctly', function() {
        
        var deletePaddockId = "556cf39d42641a0772a615a2"; // id of paddock 1
                
        httpBackend
        .whenDELETE("https://localhost:9018/api/spatial/paddocks/" + deletePaddockId)
        .respond(paddockAPI.request('DELETE', null, {paddock_oid: deletePaddockId}));
        
        httpBackend
        .whenGET("https://localhost:9018/api/spatial/paddocks/?farm_id=1")
        .respond(paddockAPI.request('GET', null, {farm_id: 1}));
        
        PaddockService.remove(deletePaddockId, function(err, res) {  // delete a paddock.

            expect(res.message).toEqual("Paddock Deleted");
            
            PaddockService.find(1, function(err, res) {         // get paddocks from farm that 
                                                                // just had a paddock deleted.
                var paddocks = res;
                var paddockExists = false;
                
                // make sure the delete paddock doesn't exist.
                paddocks.forEach(function(paddock) {
        
                    if(paddock._id === deletePaddockId) {
                        
                        paddockExists = true;
                    }
                });                
                expect(paddockExists).toEqual(false);
            });
        });
    });
            
    function FakeAPI() {

        var farm1 = {
            id: 1,
            name: "farm_1"
        };
        var farm2 = {
            id: 2,
            name: "farm_2"
        };
        
        var farm3 = {
            id: 3,
            name: "farm_3"
        };
        
        var paddock1 = {
            _id: "556cf39d42641a0772a615a2",            
            name: "Paddock 1",
            farm_id: 1, 
            created: "2015-06-02T00:06:53.828Z",
            updated: "2015-06-02T00:06:53.828Z",                       
            loc:{
                coordinates:[
                    [
                        [169.95735347270966, -46.10179426131701],
                        [169.9585121870041, -46.10080484516426],
                        [169.96124804019928, -46.10232615815096],
                        [169.96037364006042, -46.10314445100912],
                        [169.95735347270966, -46.10179426131701]
                    ]
                ],
                type: "Polygon"
            }
        };
        var paddock2 = {            
            _id: "556cf39e42641a0772a61607",
            name: "Paddock 2",            
            farm_id: 1,
            created: "2015-06-02T00:06:54.724Z",
            updated: "2015-06-02T00:06:54.724Z",
            loc:{
                coordinates:[
                    [
                        [169.95851755142212, -46.10070813436217],
                        [169.96134996414185, -46.10225920638424],
                        [169.96244966983795, -46.10125120051412],
                        [169.95964407920837, -46.09970753956845],
                        [169.95851755142212, -46.10070813436217]
                    ]
                ],
                type: "Polygon"
            }
        };
        var paddock3 = {            
            _id:"556cf39f42641a0772a6166c",
            name:"Paddock 3",            
            farm_id: 2,
            created:"2015-06-02T00:06:55.640Z",
            updated: "2015-06-02T01:06:55.640Z",
            loc:{
                coordinates:[
                    [
                        [169.95993375778198, -46.10375760457556],
                        [169.9611783027649, -46.102537613522806],
                        [169.96553421020508, -46.104992446074974],
                        [169.96428966522217, -46.1060636114778],
                        [169.95993375778198, -46.10375760457556]
                    ]
                ],
                type:"Polygon"
            }
        };
        var paddock4 = {
            _id: "556cf3a042641a0772a616d1",
            name: "Paddock 4",
            farm_id: 2,
            created: "2015-06-02T00:06:56.591Z",
            updated: "2015-06-02T01:06:56.591Z",
            loc: {
                coordinates:[
                    [ 
                        [169.9613070487976, -46.102463222951194],
                        [169.96291637420654, -46.10090099776043],
                        [169.9672293663025, -46.103341025300246],
                        [169.9656844139099, -46.10485854893615],
                        [169.9613070487976, -46.102463222951194]
                    ]
                ],
                type: "Polygon"
            }
        };       
        var paddock5 = {
            _id: "556cf4e8e08f4b8e72238423",
            name: "Paddock 5",
            farm_id: 3,
            created: "2015-06-02T00:12:24.029Z",
            updated: "2015-06-02T00:12:24.029Z",
            loc: {
                coordinates: [
                    [
                        [171.10107421875, -43.61672394843222],
                        [170.26611328125, -44.1709100968703],
                        [171.97998046875, -44.29685697148883],
                        [171.10107421875, -43.61672394843222]
                    ]
                ],
                type: "Polygon"
            }
        };
        
        this.farms = [farm1, farm2, farm3];
        this.paddocks = [paddock1, paddock2, paddock3, paddock4, paddock5];
    }
    
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

        var res = {};
        
        var paddock = reqBody;

        // Check required details where provided
        if(!paddock.name) {
                    
            res.message = "A paddock name must be provided";
        }
        else if(!paddock.farm_id) {
                    
            res.message = "A farm id must be provided";
        }
        else if(!paddock.loc || !paddock.loc.coordinates) {
                    
            res.message = "Paddock border coordinates must be provided";
        }
        else if(!Array.isArray(paddock.loc.coordinates) ||
           !Array.isArray(paddock.loc.coordinates[0]) ||
           paddock.loc.coordinates[0].length < 2 ) {
                 
            res.message = "Paddock border coordinates are incorrectly formatted";
        }
        else {

            if(!paddock.created){

                paddock.created = new Date().getTime();                     
            }

            if(!paddock.updated){
                    
                paddock.updated = new Date().getTime();
            }
                                
            // Create a paddock and save in local array
            var newPaddock = {                    
                _id: this.generateRandomId(),
                name: paddock.name,
                farm_id: paddock.farm_id,
                loc: {                        
                    type: "Polygon",
                    coordinates: paddock.loc.coordinates
                },
                created: paddock.created,
                updated: paddock.updated
            };                
            this.paddocks.push(newPaddock);
            res.message = "New Paddock Saved";
            res.paddock = newPaddock;
        }

        return res;
    };
    
    FakeAPI.prototype.get = function(reqParams) {
        
        var res = {};
        
        if(reqParams.farm_id) {                    
                   
            res.paddocks = [];
                    
            this.paddocks.forEach(function(paddock) {

                if(paddock.farm_id === reqParams.farm_id) {
                    
                    res.paddocks.push(paddock);
                }
            });
        }
        else {
                    
            res.paddocks = this.paddocks;
        }

        if(reqParams.include && reqParams.include === 'farm') {
                
            var farms = this.farms;

            res.paddocks.forEach(function(paddock) {
                    
                farms.forEach(function(farm) {  
                           
                    if(farm.id === paddock.farm_id) {
                                
                        paddock.farm = farm;
                    }                                      
                });
            });
        }          
        return res;
    };

    FakeAPI.prototype.put = function(reqParams, reqBody) {
        
        var res = {};
        
        if(!reqParams.paddock_oid) {
                    
            res.message = "A paddock id must be provided";            
        }
        else {
            
            var paddockId = reqParams.paddock_oid;
            var paddockUpdates = reqBody;
                
            var paddock = null;
            res.message = "Paddock not found";
                
            this.paddocks.forEach(function(paddock) {
                
               if(paddock._id === paddockId) {
                        
                    for(var key in paddockUpdates) {
                        
                        paddock[key] = paddockUpdates[key];
                    }
                    res.data = paddock;
                    res.message = "Paddock Updated";
                }
            });
        }
        return res;
    };
    
    FakeAPI.prototype.remove = function(reqParams) {
    
        var res = {};
        
        if(!reqParams.paddock_oid) {
            res.message = "A paddock id must be provided";            
        }
        else {
            paddockId = reqParams.paddock_oid;
 
            res.message = "Paddock not found";

            for(var i = 0; i < this.paddocks.length; i++) {

                if(this.paddocks[i]._id === paddockId) {

                    this.paddocks.splice(i, 1);
                    res.message = "Paddock Deleted";
                }
            }
        }
        return res;    
    };
    
    FakeAPI.prototype.generateRandomId = function() {
         
        var id = "";
        var possible = "abcdef0123456789";

        for(var i = 0; i < 24; i++) {
           
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return id;
    };
});