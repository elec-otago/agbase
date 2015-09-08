/**
 * Authentication for all tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Tim Molteno
 * http://jaketrent.com/post/authenticated-supertest-tests/
 *
 * var api = supertest('https://localhost:8443');
 * var login = require('./login');
 * var token;
 * 
 * before(function (done) {
 *     login.login(api, function (loginToken) {
 *       token = loginToken;
 *       done();
 *     });
 *   });
 * 
 **/
// var supertest = require('supertest');
// var api = supertest('https://localhost:8443');
var dbDefaults = require('../../../db/dbDefaults');

var unittestAccount = {
  email: dbDefaults.testUser.email,
  password: dbDefaults.testUser.password
};

var guestAccount = {
  email: dbDefaults.guestUser.email,
  password: dbDefaults.guestUser.password
};

exports.guestAccount = guestAccount;

var token;

exports.guest_login = function (request, done) {
  request
    .post('/api/auth')
    .set('Accept', 'application/json')
    .send(guestAccount)
    .end(function (err, res) {
      token = res.body.token;
      console.log("got guest token " + res.body.token);
      
      done(err, token);
    });
};

exports.login = function (request, done) {
  request
    .post('/api/auth')
    .set('Accept', 'application/json')
    .send(unittestAccount)
    .end(function (err, res) {
      token = res.body.token;
      console.log("got token " + res.body.token);
      
      done(err, token);
    });
};

/**
 * Automate authenticated get requests
 * */
exports.get = function (request, route, done) {
  request
    .get(route)
    .set('Authorization', 'Bearer '+ token)
    .end(done);
};

/**
 * Automate authenticated post requests
 * */
exports.post = function (request, route, data, done) {
  request
      .post(route)
      .set('Authorization', 'Bearer '+ token)
      .send(data)
      .end(done);
};


/**
 * Automate authenticated post requests
 * */
exports.put = function (request, route, data, done) {
  request
      .put(route)
      .set('Authorization', 'Bearer '+ token)
      .send(data)
      .end(done);
};
/**
 * Automate authenticated delete requests
 * */
exports.delete = function (request, route, done) {
  request
    .delete(route)
    .set('Authorization', 'Bearer '+ token)
    .end(done);
};
