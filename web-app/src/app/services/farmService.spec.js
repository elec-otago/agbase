/**
 * AgBase: Farm Service Test
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: John Harbourne.
 *
 **/
describe('FarmService', function() {
    var FarmService, httpBackend;

    beforeEach(function(){        
        angular.mock.module('ngMoogle');  
        inject(function(_FarmService_, $httpBackend){
            FarmService = _FarmService_;
            httpBackend = $httpBackend;
        });
    });  

    
    afterEach(function() { // needs to be before flush
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
   
    
    afterEach(function(){ // needs to be after verify
        httpBackend.flush();
    });
    
//======= it's after here =======
    
    it('should test farmService create', function(){
        var JSONResponce = {farm:{name:"Test Farm",id:4},message:"Created",apiCallCount:76};
        
        httpBackend.whenPOST("https://localhost:9018/api/farms/").respond(JSONResponce);
        FarmService.create("Test Farm",function(err,algorithm){          
            expect(err).toBeNull();
            expect(algorithm.name).toBe("Test Farm");
        });   
        
    });
    
    it('should test farmService remove', function(){
        var JSONResponce = {message:"Removed Farm ID 1000",apiCallCount:37};
        
        httpBackend.when('DELETE',"https://localhost:9018/api/farms/1000").respond(JSONResponce);
        FarmService.remove(1000,function(err,farm){          
            expect(err).toBeNull();
        });   
        
    });
    
    describe('should test farmService - findall',function(){
        it('should test algorithm - findall',function(){
            var JSONResponce = {farms:[{id:2,name:"Liquid Calcium"},{id:3,name:"Demo Farm"},{id:4,name:"test"}],apiCallCount:97};
            httpBackend.when('GET',"https://localhost:9018/api/farms/").respond(JSONResponce);
            
            FarmService.findAll(null,null,null, function(err,farms){          
                expect(err).toBeNull();
                expect(farms[0].name).toBe("Liquid Calcium");
            }); 
        });
        
        
        it('should test farmService - findall - include herds',function(){
            var JSONResponce = {farms:[{id:2,name:"Liquid Calcium",herds:[{id:3,name:"Herd 1",FarmId:2}]},{id:3,name:"Demo Farm",herds:[{id:7,name:"Demo Herd 2",FarmId:3},{id:6,name:"Demo Herd 1",FarmId:3}]},{id:4,name:"test",herds:[]}],apiCallCount:121};
            httpBackend.when('GET',"https://localhost:9018/api/farms/?include=herds").respond(JSONResponce);
            
            FarmService.findAll(true, null, null, function(err,farms){          
                expect(err).toBeNull();
                expect(farms[0].name).toBe("Liquid Calcium");
                expect(farms[0].herds).toBeDefined();
                expect(farms[2].herds.length).toBe(0);
            });       
        });
        
        it('should test farmService - findall - include animals',function(){
            var JSONResponce = {farms:[{id:3,name:"Demo Farm",animals:[{id:962,eid:"undefined",vid:577,HerdId:6,FarmId:3},{id:965,eid:"undefined",vid:263,HerdId:6,FarmId:3},{id:970,eid:"undefined",vid:162,HerdId:6,FarmId:3},{id:975,eid:"undefined",vid:54,HerdId:6,FarmId:3},{id:977,eid:"undefined",vid:240,HerdId:6,FarmId:3},{id:980,eid:"undefined",vid:238,HerdId:6,FarmId:3},{id:983,eid:"undefined",vid:4,HerdId:6,FarmId:3},{id:993,eid:"undefined",vid:762,HerdId:6,FarmId:3},{id:995,eid:"undefined",vid:85,HerdId:6,FarmId:3},{id:1045,eid:"undefined",vid:324,HerdId:6,FarmId:3}]},{id:2,name:"Liquid Calcium",animals:[{id:5,eid:"982 091000582465",vid:"undefined",HerdId:3,FarmId:2},{id:6,eid:"982 000184947864",vid:"undefined",HerdId:3,FarmId:2},{id:7,eid:"982 123463805833",vid:"undefined",HerdId:3,FarmId:2},{id:9,eid:"982 091000582256",vid:"undefined",HerdId:3,FarmId:2},{id:10,eid:"982 091000582345",vid:"undefined",HerdId:3,FarmId:2},{id:11,eid:"982 123463806043",vid:"undefined",HerdId:3,FarmId:2},{id:12,eid:"982  091000582485",vid:"undefined",HerdId:3,FarmId:2},{id:21,eid:"982 091000582575",vid:"undefined",HerdId:3,FarmId:2},{id:22,eid:"982 000159921366",vid:"undefined",HerdId:3,FarmId:2},{id:23,eid:"982 000160286644",vid:"undefined",HerdId:3,FarmId:2}]},{id:4,name:"test",animals:[]}],apiCallCount:127};
            httpBackend.when('GET',"https://localhost:9018/api/farms/?include=animals").respond(JSONResponce);
            
            FarmService.findAll(null, true, null, function(err,farms){          
                expect(err).toBeNull();
                expect(farms[0].name).toBe("Demo Farm");
                expect(farms[0].animals).toBeDefined();
                expect(farms[0].animals.length).toBe(10);
                expect(farms[1].animals.length).toBe(10);
                expect(farms[2].animals.length).toBe(0);
            });       
        });
        
        it('should test algorithm - findall - include permissions',function(){
            var JSONResponce = {farms:[{id:2,name:"Liquid Calcium",permissions:[{id:3,UserId:2,FarmId:2,FarmRoleId:2}]},{id:3,name:"Demo Farm",permissions:[{id:4,UserId:5,FarmId:3,FarmRoleId:1},{id:5,UserId:2,FarmId:3,FarmRoleId:2},{id:6,UserId:10,FarmId:3,FarmRoleId:2}]},{id:4,name:"test",permissions:[]}],apiCallCount:131};
            httpBackend.when('GET',"https://localhost:9018/api/farms/?include=permissions").respond(JSONResponce);
            
            FarmService.findAll(null,null,true, function(err,farms){          
                expect(err).toBeNull();
                expect(farms[0].name).toBe("Liquid Calcium");
                expect(farms[0].permissions.length).toBe(1);
                expect(farms[1].permissions.length).toBe(3);
                expect(farms[2].permissions.length).toBe(0);
            }); 
        });
        
    });
    
    describe("should test farmService - getFarmByName",function(){
        it('should test algorithm - getFarmByName',function(){
            var JSONResponce = {farms:[{id:2,name:"Liquid Calcium"}],apiCallCount:136};
            httpBackend.when('GET',"https://localhost:9018/api/farms/?name=Liquid Calcium").respond(JSONResponce);
            
            FarmService.findFarm("Liquid Calcium",null, function(err,farms){          
                expect(err).toBeNull();
                expect(farms[0].name).toBe("Liquid Calcium");
            }); 
        });
        
        it('should test algorithm - getFarmByName - include permissions',function(){
            var JSONResponce = {farms:[{id:2,name:"Liquid Calcium",permissions:[{id:3,UserId:2,FarmId:2,FarmRoleId:2}]}],apiCallCount:136};
            httpBackend.when('GET',"https://localhost:9018/api/farms/?name=Liquid Calcium&include=permissions").respond(JSONResponce);
            
            FarmService.findFarm("Liquid Calcium",true, function(err,farms){          
                expect(err).toBeNull();
                expect(farms[0].name).toBe("Liquid Calcium");
                expect(farms[0].permissions).toBeDefined();
            }); 
        }); 
    });
});






























