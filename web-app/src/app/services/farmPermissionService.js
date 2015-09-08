/**
 * AgBase: Farm Permission Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * REST api service for communicating with Farm Permission API
 *
 * Farm Permission Model:
 *
 * {
 *               id: <permissionId>
 *           FarmId: <farmId>
 *           UserId: <userId>
 *       FarmRoleId: <farmRoleId>
 *             farm: <optional farm include>
 * }
 *
 */

appServices.factory('FarmPermissionService', function ($log, $http,$ag, UserService) {

    'use strict';
    var farmPermissionsRoute = '/farm-permissions/';


    /*
     * find - find farm permissions
     * @param userId - optional filter by userId
     * @param farmId - optional filter by farmId
     * @param includeFarms - include the farm objects
     * @param callback - function(err, permissions)
     *                  - permissions is an array of permissions stored on the server
     *                  - err standard js Error object
     */
    var find = function(userId, farmId, includeFarms, includeUser,includeRoles, callback){
        var getOptions = { params: {} };
        var inc = [];

        if(includeFarms === true) {
            inc.push("farm");
        }
        
        if(includeUser === true) {
            inc.push("user");
        }

        if(includeRoles === true) {
            inc.push("farmRole");
        }
        
        if(inc.length > 0){
            getOptions.params.include = inc.join();
        }
       
        $log.debug("include = " + inc.join());

        if(userId) {
            getOptions.params.userId = userId;
        }

        if(farmId) {
            getOptions.params.farmId = farmId;            
        }
        $log.debug("getOptions  = " + JSON.stringify(getOptions));

        $http.get(options.api.base_url + farmPermissionsRoute,getOptions).success(function(data){

            $log.debug("FarmPermissionService find = " + JSON.stringify(data));
            callback(null, data.permissions);

        }).error(function(data, status){

            $log.error(status);
            $log.error(data);
            callback(new Error(status), null);

        });
    };


    /*
     * remove - remove a farm permission
     * @param id - id of the permission to remove
     * @param callback - function(err)
     *                  - err standard js Error object
     */
    var remove = function(id, callback){

        $http['delete'](options.api.base_url + farmPermissionsRoute + id).success(function(data){

            callback(null);

        }).error(function(data, status){

            $log.error(status);

            callback(new Error(status));

        });
    };


    /*
     * create - add a farm permission
     * @param farmId - id of the farm for permission
     * @param userId - id of the user getting the permission
     * @param roleId - id of the farm role the user has on the specified farm
     * @param callback - function(err, permission)
     *                 - err standard js Error object
     *                 - farm that has been created
     */
    var create = function(farmId, userId, roleId, callback){

        var permissionDetails = {farmId: farmId, userId: userId, farmRoleId: roleId};

        $http.post(options.api.base_url + farmPermissionsRoute, permissionDetails).success(function(data){

            callback(null, data.permission);

        }).error(function(data, status){

            $log.error(status);

            callback(new Error(status), null);

        });
    };

    var update = function(permission, roleId, callback){
        var permissionDetails = {farmRoleId: roleId};
        var query ="";
        if(permission!=null) {
            query = permission.id;
        }

        $http.put(options.api.base_url + farmPermissionsRoute + query, permissionDetails).success(function(data){

            callback(null, data);
        }).error(function(data, status){
            $log.error(status);

            callback(new Error(status), null);
        });
    };

    //public functions
    return{
        find: find,
        create: create,
        remove: remove,
        update: update
    };

});