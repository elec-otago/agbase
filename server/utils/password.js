/**
 * Password Utility
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
var Promise = require("../wowPromise");
var bcrypt = Promise.promisifyAll(require('bcrypt'));

var SALT_WORK_FACTOR = 10;

/*
 * param - callback - function(err, isMatch)
 */
exports.compare = function(password, hash) {

    if(! password || ! hash) {
        return Promise.reject(new Error('Password or hash is missing'));
    }

    return bcrypt.compareAsync(password, hash);
};


exports.hash = function(password){

    return bcrypt.genSaltAsync(SALT_WORK_FACTOR)
        .then(function(salt) {
            return bcrypt.hashAsync(password, salt);
        });
};