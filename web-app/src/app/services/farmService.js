/**
 * AgBase: Farm Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * REST api service for communicating with Farm API
 *
 * Farm Model:
 *
 * {
 *               id: <farmId>
 *             name: <farmName>
 *       herds: <optional herds include>
 * }
 *
 */

appServices.factory('FarmService', function ($http, $ag) {

    var farmsRoute = '/farms/';


    /**
    * findAll - Find All farms.
    *
    * @param {Boolean} includeHerds - add the herds in the farm to the json response
    * @param {Boolean} includeAnimals - add the herds in the farm to the json response - not really recommended (could make for a large response)
    * @param {Boolean} includePermissions - add the FarmPermissions for the farm to the JSON Response
    * @param - callback(err, farms)
    */
    var findAll = function(includeHerds, includeAnimals, includePermissions, callback) {
        var getOptions = { params: {} };
        var inc = [];

        if(includeHerds === true) {
          inc.push("herds");
        }

        if(includeAnimals === true){
            inc.push( "animals");
        }

        if(includePermissions === true){
            inc.push("permissions");
        }
        
        if (inc.length > 0) {
          getOptions.params.include = inc.join();
        }
        $http.get(options.api.base_url + farmsRoute, getOptions ).success(function(data){

            callback(null, data.farms);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    var findAllAsPromised = function(includeHerds, includeAnimals, includePermissions) {

        var getOptions = $ag.createGetOptions();

        getOptions.addIncludeIfShould('herds', includeHerds);
        getOptions.addIncludeIfShould('animals', includeAnimals);
        getOptions.addIncludeIfShould('permissions', includePermissions);

        return $http.get(options.api.base_url + farmsRoute, getOptions).then(function(result){

            return result.data.farms;

        });
    };


    var getFarmByName = function(name, includePermissions, callback){
        var include = "";
        if(name) {
            include += "?name=" + name;
        }
        if(includePermissions){
            include += name ? "&include=permissions" : "?include=permissions";
        }
        $http.get(options.api.base_url + farmsRoute + include).success(function(data){
            callback(null, data.farms);
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

        $http['delete'](options.api.base_url + farmsRoute + id).success(function(data){

            callback(null);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status));

        });
    };


    /*
     * create - add a farm
     * @param name - name of the farm to create
     * @param callback - function(err, farm)
     *                 - err standard js Error object
     *                 - farm that has been created
     */
    var create = function(farmName, callback){

        var farmDetails = {name: farmName};

        $http.post(options.api.base_url + farmsRoute, farmDetails).success(function(data){

            console.log(JSON.stringify(data));
            callback(null, data.farm);

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
        findFarm: getFarmByName,
        findAllAsPromised: findAllAsPromised
    };

});