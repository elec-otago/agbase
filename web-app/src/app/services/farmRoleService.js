/**
 * AgBase: Farm Role Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * REST api service for communicating with Farm Role API
 *
 * Farm Role Model:
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

appServices.factory('FarmRoleService', function ($http, $window) {

    'use strict';
    var farmRolesRoute = '/farm-roles/';

    //returns object roles and includes farm objects
    var find = function(callback){

        $http.get(options.api.base_url + farmRolesRoute).success(function(data){

            callback(null, data.roles);

        }).error(function(data, status) {

            console.log(status);

            callback(new Error(status), null);

        });
    };


    //public functions
    return{
        find: find
    };

});