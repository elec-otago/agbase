/**
 * AgBase: Animal Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author:Mark Butler.
 *
 **/
appServices.factory('AnimalService', function ($http, $window, $sce, $q) {

    'use strict';
    var animalsRoute = '/animals/';

    var findAll = function(farmId, herdId, eid, vid, offset, includeHerd, includeFarm, callback) {
        var getOptions = { params: {limit:1000} };
        var inc = [];

        if(includeHerd === true) {
            inc.push("herd");
        }

        if(includeFarm === true){
            inc.push("farm");
        }

        
        if(inc.length > 0){
            getOptions.params.include = inc.join();
        }   
        
        if(offset){
            getOptions.params.offset=offset;
        }
        
        if(farmId){
           getOptions.params.farmId=farmId;
        }

        if(herdId){
            getOptions.params.herdId = herdId; 
        }

        if(eid){
            getOptions.params.eid = eid; 
        }

        if(vid){
            getOptions.params.vid = vid; 
        }

        console.log("query address: " + options.api.base_url + animalsRoute + JSON.stringify(getOptions));

        $http.get(options.api.base_url + animalsRoute,getOptions).success(function(data){
            
                 
            callback(null, data.animals);
            
            

        }).error(function(data, status){

            console.log(status);
            console.log(data);
            callback(new Error(status), null);

        });
    };
    
    
    var count = function(farmId, herdId, callback){       
        var countOptions = { params: {farmId:farmId} };
        if(herdId){
            countOptions.params.herdId = herdId;
        }        
        
        $http.get(options.api.base_url + animalsRoute + "count",countOptions).success(function(data){
            callback(null, data.count);
        }).error(function(data, status){
            console.log(status);
            callback(new Error(status), null);
        });
    };


    /*
    * query = {
    *   farmId: <id>
    *   herdId: <id>
    *   eid: <id>
    *   vid: <vid>
    * };
     */

    var getCountAsPromised = function(query){

        console.log("get animal count with query");
        console.log(query);
        
        var  reqOptions = {params: query};

        return $http.get(options.api.base_url + animalsRoute + "count", reqOptions).then(function(result){

            return result.data.count;
        });
    };


    var findAsPromised = function(query) {

        if(! query.limit){
            query.limit = 1000;
        }

        var getOptions = { params: query };

        return $http.get(options.api.base_url + animalsRoute,getOptions).then(function(result) {


            return result.data.animals;
        });
    };


    var remove = function(id, callback){

        $http['delete'](options.api.base_url + animalsRoute + id).success(function(data){

            callback(null);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status));

        });
    };


    var findInFarm = function(farmId, callback){

        $http.get(options.api.base_url + animalsRoute + "?include=herd&farmId="+farmId).success(function(data){

            callback(null, data);

        }).error(function(data, status){

            console.log(status);
            callback(new Error(status), null);
        });
    };


    var findInHerd = function(farmId, herdId, callback){

        $http.get(options.api.base_url + animalsRoute + "?farmId=" + farmId + "&herdId="+herdId).success(function(data){
            for (var postKey in data) {
                //data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }

            callback(null, data.animals);
        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    var findByEid = function(eid, callback){
        $http.get(options.api.base_url + animalsRoute + "?eid="+eid).success(function(data){


            callback(null, data.animals);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    var create = function(eid, farmId, herdId, vid, callback){

        var animalDetails = {eid: eid, farmId: farmId};

        if(herdId) {
            animalDetails.herdId = herdId;
        }

        if(vid) {
            animalDetails.vid = vid;
        }

        return $http.post(options.api.base_url + animalsRoute, animalDetails).success(function(data){

            callback(null, data.animals);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };

    var get = function(id, callback){
        $http.get(options.api.base_url + animalsRoute + id).success(function(data){
            console.log("animal.get data: " +JSON.stringify(data));
            callback(null,data.animal);
        }).error(function(){
            console.log(status);
            callback(new Error(status), null);
        });
    };

    var update = function(animalId, farmId, herdId, eid, vid, callback){
        var animalDetails = {farmId: farmId, herdId: herdId, eid: eid, vid: vid};
        $http.put(options.api.base_url + animalsRoute + animalId, animalDetails).success(function(data){
            callback(null, data);
        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);
        });
    };

    //public functions
    return{
        findAll: findAll,
        remove: remove,
        create: create,
        count: count,
        getCountAsPromised: getCountAsPromised,
        findAsPromised: findAsPromised,
        findInFarm: findInFarm,
        findInHerd: findInHerd,
        findByEid: findByEid,
        get: get,
        update: update
    };

});