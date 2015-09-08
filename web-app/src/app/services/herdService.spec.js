/**
AgBase: Herd Service Test

Copyright (c) 2015. Elec Research.

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/
 
Author: John Harborne

*/

describe('HerdService', function() {
    var HerdService, httpBackend;

    beforeEach(function(){        
        angular.mock.module('ngMoogle');  
        inject(function(_HerdService_, $httpBackend){
            HerdService = _HerdService_;
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
    
    it('HerdService remove', function(){
        var jsonResponce = {message:"Removed herd ID 1000",apiCallCount:37};    
        // this is only needed if your are doing sever calls. The console will tell you what the address you need will be.
        httpBackend.when('DELETE',"https://localhost:9018/api/herds/1000").respond(jsonResponce);
            
        HerdService.remove(1000,function(err,herds){          
            expect(err).toBeNull();//expects are the tests
        }); 
    });
    
    xit('should test herdsService create', function(){
        var JSONResponce = {herds:{name:"Test Algorithm",MeasurementCategoryId:3,id:5},message:"Created Algorithm!",apiCallCount:44};
        
        httpBackend.whenPOST("https://localhost:9018/api/herds/").respond(JSONResponce);
        HerdService.create("Test Algorithm",3,function(err,herds){          
            expect(err).toBeNull();
            expect(herds.name).toBe("Test Algorithm");
            expect(herds.MeasurementCategoryId).toBe(3);
        });   
        
    });
});