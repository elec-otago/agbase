/**
 * AgBase: Herd Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * REST api service for communicating with Herd API
 *
 * Herd Model:
 *
 * {
 *               id: <herdId>
 *             name: <herdName>
 *           FarmId: <FarmId>
 *             farm: <optional include of farm>
 *          animals: <optional include of animals in herd>
 * }
 *
 */

appServices.factory('HerdService', function ($http, $window, $sce) {

    var herdsRoute = '/herds/';

    /*
     * findAll - Find All herds.
     *
     * @param - includeFarm - include the farm that the herd belongs to in the json response
     * @param - callback(err, herds)
     */
    var findAll = function(includeFarm, callback) {

        var getOptions = { params: {} };

        if(includeFarm) {
            getOptions.params.include = "farm";
        }

        $http.get(options.api.base_url + herdsRoute, getOptions).success(function(data){

            callback(null, data.herds);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    /*
     * get - get a herd by id.
     *
     * @param - id, the ID of the herd to load
     * @param - callback(err, herd)
     */
    var get = function(id, callback){

        $http.get(options.api.base_url + herdsRoute + "/" + id).success(function(data){

            callback(null, data.herd);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    /*
     * findInFarm - find all the herds in a farm
     *
     * @param - farmID, the ID of the farm to search for herds
     * @param - callback(err, herds)
     */
    var findInFarm = function(farmId, callback){

        var getOptions = { params: { farm: farmId } };

        $http.get(options.api.base_url + herdsRoute, getOptions).success(function(data){

            callback(null, data.herds);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    /*
     * remove - remove the herd with the specified id
     *
     * @param - id of the herd to remove
     * @param - callback(err)
     */
    var remove = function(id, callback){

        $http['delete'](options.api.base_url + herdsRoute + id).success(function(data){

            callback(null, data.herd);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };

    var update = function(herdIdIn, herdName, callback){
        var herdDetails = {herdId: herdIdIn, name: herdName};

        var query = "";
        if(herdIdIn != null){
            query += "?herd_id=" + herdIdIn;
        }

        $http.put(options.api.base_url + herdsRoute +herdIdIn, herdDetails).success(function(data){

            callback(null, data.herd);

        }).error(function(data, status){
            console.log(status);

            callback(new Error(status), null);
        });
    };


    /*
     * create - create the herd with the specified name
     *
     * @param - name of the herd to create
     * @param - farmId id of the farm the herd goes in
     * @param - callback(err, herd)
     */
    var create = function(herdName, farmId, callback){

        var herdDetails = {name: herdName, farmId: farmId};

        $http.post(options.api.base_url + herdsRoute, herdDetails).success(function(data){

            callback(null, data.herd);

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
        update: update,
        findInFarm: findInFarm,
        get: get
    };

});