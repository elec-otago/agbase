/**
 * /users Route Tests
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Mark Butler, Tim Molteno
 *
 **/

describe('UserRestAPI', function(){

    var createdUser;

    var dataSource = require('../dataSource');
    var agAPI = require('./utils/agAPI');

    var connection = agAPI.newConnection();

    before(function(){

        return connection.loginAsTest().then(function(){

            return dataSource.setup();
        });
    });

    describe('#get users', function() {

        it('should get all users', function () {

            return connection.get('/users')
                .expect(200)
                .then(function (res) {

                    should.exist(res.body.users);

                    res.body.users.should.not.be.empty;

                    res.body.users.should.all.have.property('id');
                    res.body.users.should.all.have.property('email');
                    res.body.users.should.all.have.property('firstName');
                    res.body.users.should.all.have.property('lastName');
                    res.body.users.should.all.have.property('lastName');
                    res.body.users.should.all.not.have.property('hash');
                    res.body.users.should.all.have.property('globalRoleId');
                    res.body.users.should.all.have.property('usageTierId');
                });
        });
    });

    describe('#create users', function() {

        it('should create a user', function () {

            var userDetails = {
                firstName: "test",
                lastName: "person",
                password: "goose",
                email: "Goose@mail.com",
                globalRoleName: 'user'
            };


            return connection.post('/users/', userDetails)
                .expect(200)
                .then(function (res) {

                    should.exist(res.body.user);

                    createdUser = res.body.user;

                    should.not.exist(createdUser.hash);
                });
        });

        after(function () {

            if (!createdUser) {
                return Promise.resolve();
            }

            return connection.delete('/users/' + createdUser.id)
                .expect(200);
        });
    });

    describe('#test permissions', function() {

        var guestConnection;

        before(function(){

            guestConnection = agAPI.newConnection();

            return guestConnection.loginAsGuest();

        });


        it('should not create a user as guest', function () {

            var userDetails = {
                firstName: "test",
                lastName: "person",
                password: "goose",
                email: "Goose@mail.com",
                globalRoleName: 'user'
            };


            return guestConnection.post('/users/', userDetails)
                .expect(403);

        });

        it('should not remove a user as guest', function () {

            return guestConnection.delete('/users/' + dataSource.demoUser.id)
                .expect(403);

        });

    });
});