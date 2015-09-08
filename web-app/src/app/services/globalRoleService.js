/**
 * AgBase: Global Role Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 **/
appServices.factory('GlobalRoleService', function ($http, $window) {

    var globalRolesRoute = '/global-roles/';

    //returns roles
    var findAll = function(){

        return $http.get(options.api.base_url + globalRolesRoute);

    };


    //public functions
    return{
        findAll: findAll
    };

});