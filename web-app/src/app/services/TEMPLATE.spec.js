/**
AgBase: Template UNITTEST

Copyright (c) 2015. Elec Research.

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/
 
Author: John Harborne

Instructions:

1. Remove the x in front of xdescribe. x stops the tests from running. Can be used on an it as well.
2. Find and replce on the word TempService with which ever service you are working on. 
3. Put its inside the describe 
4. Really good reference http://jasmine.github.io/2.0/introduction.html
*/

xdescribe('TempService', function() {
    var TempService, httpBackend;

    beforeEach(function(){        
        angular.mock.module('ngMoogle');  
        inject(function(_TempService_, $httpBackend){
            TempService = _TempService_;
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
    
    xit('Example it', function(){
        var jsonResponce = {message:"Removed Category ID 1000",apiCallCount:37};    
        // this is only needed if your are doing sever calls. The console will tell you what the address you need will be.
        httpBackend.when('DELETE',"https://localhost:9018/api/measurement-categories/1000").respond(jsonResponce);
            
        TempService.remove(1000,function(err,categories){          
            expect(err).toBeNull();//expects are the tests
        });  
    });
    
});