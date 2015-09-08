/**
AgBase: Template UNITTEST

Copyright (c) 2015. Elec Research.

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/
 
Author: John Harborne
*/

xdescribe('FarmPermissionService', function() {
    var FarmPermissionService, httpBackend;

    beforeEach(function(){        
        angular.mock.module('ngMoogle');  
        inject(function(_FarmPermissionService_, $httpBackend){
            FarmPermissionService = _FarmPermissionService_;
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
    
//======= 'it's' after here =======
    xit("should test FarmPermissionService find",function(){
        var JSONResponce = {permissions:[{id:3,UserId:2,FarmId:2,FarmRoleId:2,user:{id:2,email:"wizard@moogle.elec.ac.nz",firstName:"Wizard",lastName:"Moogle",GlobalRoleId:1},farm:{id:2,name:"Liquid Calcium"},role:{id:2,name:"Manager",editFarmPermissions:true,viewFarmPermissions:true,editFarmHerds:true,viewFarmHerds:true,editFarmAnimals:true,viewFarmAnimals:true,editFarmMeasurements:true,viewFarmMeasurements:true}},{id:4,UserId:5,FarmId:3,FarmRoleId:1,user:{id:5,email:"guest@user.com",firstName:"Guest",lastName:"User",GlobalRoleId:3},farm:{id:3,name:"Demo Farm"},role:{id:1,name:"Viewer",editFarmPermissions:false,viewFarmPermissions:true,editFarmHerds:false,viewFarmHerds:true,editFarmAnimals:false,viewFarmAnimals:true,editFarmMeasurements:false,viewFarmMeasurements:true}}],apiCallCount:173};
        httpBackend.when('GET',"https://localhost:9018/api/farm-permissions/?include=farm,user,farmRole&userId").respond(JSONResponce);
        FarmPermissionService.find(function(err,fp){          
            expect(err).toBeNull();
            //expect(fp.name).toBe("Condition Score");
            
        });  
    });
});