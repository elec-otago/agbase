/**
 * API access for tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Mark Butler
 *
 **/

var app = agquire('ag/app');
var common = require('../../common');
var dbDefaults = agquire('ag/db/dbDefaults');

var serverUrl = 'https://localhost:8443';
var apiRoot = '/api';

var unittestAccount = {
  email: dbDefaults.testUser.email,
  password: dbDefaults.testUser.password
};

var guestAccount = {
  email: dbDefaults.guestUser.email,
  password: dbDefaults.guestUser.password
};

var supertest = require('supertest-as-promised')(Promise); //use our promise
var request = supertest(serverUrl);

//defining our connection object
var Connection = {

    serverUrl: serverUrl,
    apiRoot: apiRoot,
    token: null,
    user: null,

    loginAsGuest: function(){
        return this.login(guestAccount.email, guestAccount.password);
    },

    loginAsTest: function(){
        return this.login(unittestAccount.email, unittestAccount.password);
    },

    login: function(email, password){

        var self = this; //explicitly scope a reference to this connection so we can access in the callback

        return request.post(this.apiRoot + '/auth')
            .set('Accept', 'application/json')
            .send({email:email,password: password})
            .then(function (res) {
                self.token = res.body.token;
                self.user = res.body.user;
            });
    },

    post: function(route, data){
        return request
            .post(this.apiRoot + route)
            .set('Authorization', 'Bearer '+ this.token)
            .send(data);
    },

    get: function(route, query){
        return request
            .get(this.apiRoot + route)
            .query(query)
            .set('Authorization', 'Bearer '+ this.token);
    },

    delete: function(route){
        return request
            .delete(this.apiRoot + route)
            .set('Authorization', 'Bearer '+ this.token);
    },

    put: function(route, data){
        return request
            .put(this.apiRoot + route)
            .set('Authorization', 'Bearer '+ this.token)
            .send(data);
    },

    logout: function(){
        return this.delete('/auth');
    }
};


module.exports = {
    newConnection: function(){
        return Object.create(Connection);
    },
    guestAccount: guestAccount,
    unittestAccount: unittestAccount
};
