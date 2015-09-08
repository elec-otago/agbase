/**
 * AgBase: Category Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * REST api service for communicating with Measurement Category API
 *
 * Measurement Category Model:
 *
 * {
 *               id: <categoryId>
 *             name: <categoryName>
 *       algorithms: <optional algorithms include>
 * }
 *
 */

appServices.factory('CategoryService', function ($http, $window, $sce) {

    var categoryRoute = '/measurement-categories/';
    
    /*
    * findAll - find all Measurement Categories
    * @param includeAlgorithms - boolean, will include all algorithms in each category if true
    * @param callback - function(err, categories)
    *                  - categories is an array of categories stored on the server
    *                  - err standard js Error object
    * @param json {categories:[{id:1,name:"Demo Category"},{id:2,name:"Condition Score"},{id:3,name:"Weight"}],apiCallCount:26}    
    */
    var findAll = function(includeAlgorithms, callback){
        var query = "";

        if(includeAlgorithms === true) {
            query = "?include=algorithms";
        }
        $http.get(options.api.base_url + categoryRoute + query).success(function(data){

            
            callback(null, data.categories);
            
        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };

    /*
     * findAll - find all Measurement Categories
     * @param includeAlgorithms - boolean, will include all algorithms in each category if true
     * @param callback - function(err, categories)
     *                  - categories is an array of categories stored on the server
     *                  - err standard js Error object
     * @param json {categories:[{id:1,name:"Demo Category"},{id:2,name:"Condition Score"},{id:3,name:"Weight"}],apiCallCount:26}
     */
    var findAllSpatial = function(includeAlgorithms, callback){

        var getOptions = { params: {} };

        if (includeAlgorithms) {
            getOptions.params.include = 'algorithms';
        }

        getOptions.params.isSpatial = true;

        $http.get(options.api.base_url + categoryRoute, getOptions).success(function(data){

            callback(null, data.categories);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };

    /*
     * remove - remove a measurement category
     * @param id - id of the category to remove
     * @param callback - function(err)
     *                  - err standard js Error object
     */
    var remove = function(id, callback){

        $http['delete'](options.api.base_url + categoryRoute + id).success(function(data){
            callback(null);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status));

        });
    };

    /*
     * create - add a measurement category
     * @param name - name of the category to create
     * @param {boolean} isSpatial - category is for spatial data
     * @param callback - function(err, category)
     *                 - err standard js Error object
     *                 - category that has been created
     */
    var create = function(name, isSpatial, callback){

        var category = {name: name, isSpatial: isSpatial};
        $http.post(options.api.base_url + categoryRoute, category).success(function(data){

            callback(null, data.category);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    /*
     * findByName - find a measurement category by name
     * @param name - name of the category to find
     * @param includeAlgorithms - boolean, will include all algorithms in each category if true
     * @param callback - function(err, category)
     *                 - err standard js Error object
     *                 - category with the specified name
     * @param JSON - [{id:2,name:"Condition Score",algorithms:[{id:1,name:"DairyNZ BCS",MeasurementCategoryId:2}]}]
     */
    var findByName = function(name, includeAlgorithms, callback){

        var query = "?name=" + name;

        if(includeAlgorithms){

            query+= "&include=algorithms";
        }
        $http.get(options.api.base_url + categoryRoute + query).success(function(data){

            var category = data.categories[0];
            if(! category){
                callback(new Error("No category found") , null);
            }else{
                callback(null, category);
            }

        }).error(function(data, status){

            console.log("error status: " + status);

            callback(new Error(status), null);

        });
    };

    //public functions
    return{
        findAllSpatial: findAllSpatial,
        findAll: findAll,
        remove: remove,
        create: create,
        findByName: findByName
    };
});