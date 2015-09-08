/**
 * AgBase: Category Service Test
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

describe('Category Service Test', function() {
    var CategoryService, httpBackend;

    beforeEach(function(){        
        angular.mock.module( 'ngMoogle' );  
        inject(function(_CategoryService_, $httpBackend){
            CategoryService = _CategoryService_;
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
    
    it('should test CategoryService create', function(){
        httpBackend.whenPOST("https://localhost:9018/api/measurement-categories/").respond({
            category:{
            name:"Test Category",
            id:45        
            },
            "message":"Created Measurement Category!"
        });
            
        CategoryService.create("Test Category",false,function(err,category){          
            expect(err).toBeNull();
            expect(category.name).toBe("Test Category");
        });   
        
    });
    
    it('should test CategoryService findByName including algorithms', function(){
        var JSONResponce = {categories:[{
                   id:2,
                   name:"Condition Score",
                   algorithms:[{
                       id:1,
                       name:"DairyNZ BCS",
                       MeasurementCategoryId:2
                       
                }]}],
                apiCallCount:15};
       httpBackend.when('GET',"https://localhost:9018/api/measurement-categories/?name=Condition Score&include=algorithms").respond(JSONResponce);
            
        CategoryService.findByName("Condition Score",true,function(err,category){          
            expect(err).toBeNull();
            expect(category.name).toBe("Condition Score");
            expect(category.algorithms.length).toBeGreaterThan(0);
        });  
    });
    
    it('should test CategoryService findAll not including algorithms', function(){
        var JSONResponce = {categories:[{id:1,name:"Demo Category"},{id:2,name:"Condition Score"},{id:3,name:"Weight"}],apiCallCount:26};    
        
        httpBackend.when('GET',"https://localhost:9018/api/measurement-categories/").respond(JSONResponce);
            
        CategoryService.findAll(null,function(err,categories){          
            expect(err).toBeNull();
            console.log(JSON.stringify(categories));
            expect(categories[0].name).toBe("Demo Category");
            expect(categories.length).toBe(3);
        });  
    });
    
    it('should test CategoryService remove', function(){
        var JSONResponce = {message:"Removed Category ID 1000",apiCallCount:37};    
        
        httpBackend.when('DELETE',"https://localhost:9018/api/measurement-categories/1000").respond(JSONResponce);
            
        CategoryService.remove(1000,function(err,categories){          
            expect(err).toBeNull();
        });  
    });
    
});