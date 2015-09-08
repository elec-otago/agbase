/**
 * AgBase: Algorithm Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler
 *
 * REST api service for communicating with Algorithm API
 *
 * Algorithm Model:
 *
 * {
 *                      id: <algorithmId>
 *   MeasurementCategoryId: <MeasurementCategoryId>
 *                    name: <name>
 * }
 *
 */

appServices.factory('AlgorithmService', function ($http, $window, $sce, $q) {

    var algorithmsRoute = '/algorithms/';


    /*
     * findAll - find all Algorithms
     * @param includeCategory - boolean - if true, response will include the measurement category this algorithm belongs to
     * @param callback - function(err, algorithms)
     *                  - algorithms is an array of algorithm with model format specified above
     *                  - err standard js Error object
     */
    var findAll = function(includeCategory, callback) {

        var query = "";

        if(includeCategory === true) {
            query = "?include=category";
        }
        
        $http.get(options.api.base_url + algorithmsRoute + query).success(function(data){

            console.log("data = "+JSON.stringify(data));
            callback(null, data.algorithms);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };
    
    var findByNameAsPromised = function(name){

        return $http.get(options.api.base_url + algorithmsRoute, { params: {name: name} }).then(function(result){

            var data = result.data;

            console.log("Algorithms by name (" + name + ")  = "+JSON.stringify(data));

            if(data.algorithms && data.algorithms.length > 0) {
                return data.algorithms[0];
            }else{
                return $q.reject('Algorithm Could not be found');
            }

        },function(err){

            console.log(err);
        });
    };

    /*
     * remove - remove an algorithm
     * @param id - id of the algorithm to remove
     * @param callback - function(err)
     *                 - err standard js Error object
     */
    var remove = function(id, callback){

        $http['delete'](options.api.base_url + algorithmsRoute + id).success(function(data){

            callback(null);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status));

        });
    };


    /*
     * create - add an algorithm to a measurement category
     * @param name - name of the algorithm to create
     * @param categoryId - id of the category to add this algorithm into
     * @param callback - function(err, algorithm)
     *                 - err standard js Error object
     *                 - algorithm that has been created
     * 
     * @param JSON - {algorithm:{name:"test",MeasurementCategoryId:3,id:5},message:"Created Algorithm!",apiCallCount:44}
     */
    var create = function(name, categoryId, callback){

        $http.post(options.api.base_url + algorithmsRoute, {name:name, measurementCategoryId: categoryId}).success(function(data){

            //console.log(JSON.stringify(data));
            callback(null, data.algorithm);
            
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
        findByNameAsPromised: findByNameAsPromised
    };

});
