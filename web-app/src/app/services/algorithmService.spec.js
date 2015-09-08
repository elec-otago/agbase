/**
 * AgBase: Algorithm Service Test
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: John Harborne.
 *
 **/

describe('AlgorithmService', function() {
    var AlgorithmService, httpBackend;
    beforeEach(function(){        
        angular.mock.module('ngMoogle');  
        inject(function(_AlgorithmService_, $httpBackend){
            AlgorithmService = _AlgorithmService_;
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
    
    it('should test algorithmService create', function(){
        var JSONResponce = {algorithm:{name:"Test Algorithm",MeasurementCategoryId:3,id:5},message:"Created Algorithm!",apiCallCount:44};
        
        httpBackend.whenPOST("https://localhost:9018/api/algorithms/").respond(JSONResponce);
        AlgorithmService.create("Test Algorithm",3,function(err,algorithm){          
            expect(err).toBeNull();
            expect(algorithm.name).toBe("Test Algorithm");
            expect(algorithm.MeasurementCategoryId).toBe(3);
        });   
        
    });
    
    describe('should test algorithmService - findall',function(){
        it('should test algorithm - findall - include category',function(){
            var JSONResponce = {algorithms:[{id:1,name:"DairyNZ BCS",MeasurementCategoryId:2,measurementCategory:{id:2,name:"Condition Score"}},{id:2,name:"Demo Algorithm",MeasurementCategoryId:1,measurementCategory:{id:1,name:"Demo Category"}},{id:3,name:"Manual",MeasurementCategoryId:3,measurementCategory:{id:3,name:"Weight"}},{id:4,name:"exa_tim",MeasurementCategoryId:3,measurementCategory:{id:3,name:"Weight"}},{id:5,name:"test",MeasurementCategoryId:3,measurementCategory:{id:3,name:"Weight"}}],apiCallCount:66};
            httpBackend.when('GET',"https://localhost:9018/api/algorithms/?include=category").respond(JSONResponce);
            
            AlgorithmService.findAll(true, function(err,algorithms){          
                expect(err).toBeNull();
                expect(algorithms[0].name).toBe("DairyNZ BCS");
                expect(algorithms[0].measurementCategory).toBeDefined();
            }); 
        });
        
        
        it('should test algorithmService - findall - exclude category',function(){
            var JSONResponce = {algorithms:[{id:1,name:"DairyNZ BCS",MeasurementCategoryId:2},{id:2,name:"Demo Algorithm",MeasurementCategoryId:1},{id:3,name:"Manual",MeasurementCategoryId:3},{id:4,name:"exa_tim",MeasurementCategoryId:3},{id:5,name:"test",MeasurementCategoryId:3}],apiCallCount:70};
            httpBackend.when('GET',"https://localhost:9018/api/algorithms/").respond(JSONResponce);
            
            AlgorithmService.findAll(null, function(err,algorithms){          
                expect(err).toBeNull();
                expect(algorithms[0].name).toBe("DairyNZ BCS");
                expect(algorithms[0].measurementCategory).not.toBeDefined();
            });       
        });
        
    });
    
    it('should test algorithmService remove', function(){
        var JSONResponce = {message:"Removed Algorithm ID 1000",apiCallCount:37};
        
        httpBackend.when('DELETE',"https://localhost:9018/api/algorithms/1000").respond(JSONResponce);
        AlgorithmService.remove(1000,function(err,algorithm){          
            expect(err).toBeNull();
        });   
        
    });
});