/**
 * AgBase: User Service
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
appServices.factory('UserService', function ($http, $window, $q, AuthenticationService, FarmService) {
    'use strict';

    var gotCurrentUser;

    function getStorage(itemName){
        return localStorage.getItem(itemName);
    }

    function setStorage(itemName, value){
        localStorage.setItem(itemName, value);
    }

    function invalidateStorage(itemName){
        localStorage.removeItem(itemName);
    }



    var logIn = function(email, password, saveUser) {

        var promise = $http.post(options.api.base_url + '/auth/', {email: email, password: password}).success(function(data) {

            AuthenticationService.isAuthenticated = true;
            $window.sessionStorage.token = data.token;
            $window.sessionStorage.user = JSON.stringify(data.user);
            if(saveUser) {
                setStorage("token", $window.sessionStorage.token);
                setStorage("user", $window.sessionStorage.user);
            }

        }).error(function(status, data) {

            console.log(status);
            console.log(data);

        });

        return promise;
    };


    var logOut = function() {

        var promise;

        if (AuthenticationService.isAuthenticated) {

             promise = $http['delete'](options.api.base_url + '/auth/').success(function(data){

                AuthenticationService.isAuthenticated = false;

                delete $window.sessionStorage.token;
                delete $window.sessionStorage.user;

                 invalidateStorage("token");
                 invalidateStorage("user");
                gotCurrentUser = false;

            }).error(function(status, data) {

                console.log(status);
                console.log(data);

            });
        }

        return promise;
    };

    var revalidateToken = function(token, user, callback){
        $http.put(options.api.base_url + '/auth/', {}, {headers:{Authorization: "Bearer " + token}, user: user}).success(function(data){
            AuthenticationService.isAuthenticated = true;
            $window.sessionStorage.token = data.token;
            $window.sessionStorage.user = JSON.stringify(user);
            callback(null, data);
        }).error(function(status){
            callback(new Error(status), null);
        });
    };

    var hasAutoLogin = function(){
        return (getStorage("token") && getStorage("user"));
    };

    var autoLogin = function(callback){
        revalidateToken(getStorage("token"), JSON.parse(getStorage("user")), callback);
    };


    var findAll = function(callback) {
        $http.get(options.api.base_url + '/users/?include=global-role').success(function(data){
            callback(null, data);
        }).error(function(status, data){
            callback(new Error(status, data));
        });
    };

    var getCurrentUser = function() {

        var user = $window.sessionStorage.user;

        if(!user){
            return null;
        }

        return JSON.parse(user);
    };


    var remove = function(id, callback){
        $http['delete'](options.api.base_url + '/users/' + id).success(function(data){
            callback(null, data);
        }).error(function(status, data){
            callback(new Error(status), null);
        });
    };


    /*
    * create a user = global role id is optional. if null then it will default to 'user' global role
     */
    var create = function(firstName, lastName, email, password, globalRoleId, callback){

        var user = {firstName: firstName, lastName:lastName,email:email,password:password};

        if(globalRoleId){
            user.globalRoleId = globalRoleId;
        }

        $http.post(options.api.base_url + '/users/', user).success(function(data){
            callback(null, data);
        }).error(function(status, data){
            callback(new Error(status), null);
        });

    };


    var updatePassword = function(newPassword, oldPassword){

        var promise = $http.post(options.api.base_url + '/users/', {password: newPassword}).success(function(data) {

            data.AuthenticationService.isAuthenticated = true;

            $window.sessionStorage.token = data.token;

        }).error(function(status, data) {

            console.log(status);
            console.log(data);

        });

        return promise;
    };

    var userFarms;

    var getUserFarms = function(){

        if(userFarms){
            return $q.when(userFarms);
        }

        return FarmService.findAllAsPromised(/*include herds*/true,false, /*include permissions*/true).then(function(farms){

            userFarms = farms;
            return farms;
        });
    };

    var flushUserData = function(){
        userFarms = null;

        return getUserFarms();
    };


    //public functions
    return{
        logIn: logIn,
        logOut: logOut,
        getCurrentUser: getCurrentUser,
        findAll: findAll,
        remove: remove,
        create: create,
        updatePassword: updatePassword,
        autoLogin: autoLogin,
        hasAutoLogin: hasAutoLogin,
        getUserFarms: getUserFarms,
        flushUserData: flushUserData
    };

});
