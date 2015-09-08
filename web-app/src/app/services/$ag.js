/**
 * Created by mark on 27/05/15.
 */
/**
 * AgBase: Toolbox Service
 *
 * Copyright (c) 2015. Elec Research.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 *
 * Author: John Harbourne, Mark Butler
 *
 **/
appServices.factory('$ag', function ($http, $window, $sce, $q, $log) {

    'use strict';

    function createGetOptions(){

        var params = {limit :1000}; //default limit

        var addParamIfExists = function(newParamName, newParam){
            if(newParam){
                params[newParamName] = newParam;
            }
        };

        var addIncludeIfShould = function(name, should){
            if (! should){
                return;
            }

            if(! this.params.include){
                this.params.include = name;
            }else{
                var includes = this.params.include.split();
                includes.push(name);
                this.params.include = includes.join();
            }
        };

        return {
            params: params,
            addParamIfExists: addParamIfExists,
            addIncludeIfShould: addIncludeIfShould
        };
    }

    var forEachIn = function(array, func) {

        for (var key in array) {
            if (array.hasOwnProperty(key)) {
                func(array[key]);
            }
        }
    };


    var findByIdIn = function(id,array) {

        for (var key in array) {
            if (array.hasOwnProperty(key)) {

                var item = array[key];

                if(item.id == id){
                    return array[key];
                }
            }
        }
    };

    //public functions
    return{
        createGetOptions: createGetOptions,
        forEachIn: forEachIn,
        findByIdIn: findByIdIn
    };

});