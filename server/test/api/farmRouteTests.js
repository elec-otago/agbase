/**
 * /farms Route Tests
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


describe('FarmRestAPI', function(){

    var dataSource = require('../dataSource');
    var agAPI = require('./utils/agAPI');

    var connection = agAPI.newConnection();

    before(function(){

        return connection.loginAsTest().then(function(){

            return dataSource.setup();
        }).then(function() {
            var UserController = agquire('ag/db/controllers/UserController');

            return UserController.getUser({where: {email: agAPI.guestAccount.email}});
        }).then(function(user) {
            var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');
            return FarmPermissionController.createFarmPermission(user.id, dataSource.farm1.id, dataSource.viewerFarmRole.id);
        });

    });

    describe('guest #get farm', function(){

        var guestConnection = agAPI.newConnection();

        before(function () {
            return guestConnection.loginAsGuest();
        });

        it('should get all farms the demo user can see', function(){
            return guestConnection.get('/farms')
                .expect(200)
                .then(function(res) {

                    should.exist(res.body.farms);
                    res.body.farms.should.not.be.empty;

                    res.body.farms.should.all.have.property('id');
                    res.body.farms.should.all.have.property('name');
                });
        });

        after(function () {
            return guestConnection.logout();
        });

    });

    describe('#get farm', function(){

        it('should get all farms', function(){

            return connection.get('/farms').expect(200).then(function(res){

                should.exist(res.body.farms);

                var firstFarm = res.body.farms[0];

                should.exist(firstFarm.id);
                should.exist(firstFarm.name);
            });
        });


        it('should get all farms and include herd', function(){

            return connection.get('/farms/?include=herds').expect(200).then(function(res) {

                should.exist(res.body.farms);
                res.body.farms.should.not.be.empty;
                res.body.farms.should.all.have.property('herds');
            });
        });

        it('should get all farms and include animals', function(){

            return connection.get('/farms/?include=animals').expect(200).then(function(res) {

                should.exist(res.body.farms);
                res.body.farms.should.not.be.empty;
                res.body.farms.should.all.have.property('animals');
            });
        });

        it('should get all farms and include permissions', function(){

            return connection.get('/farms/?include=permissions').expect(200).then(function(res) {

                should.exist(res.body.farms);
                res.body.farms.should.not.be.empty;
                res.body.farms.should.all.have.property('permissions');
            });
        });

        it('should get all farms and include everything', function(){

            return connection.get('/farms/?include=herds,animals,permissions').expect(200).then(function(res) {

                should.exist(res.body.farms);
                res.body.farms.should.not.be.empty;
                res.body.farms.should.all.have.property('herds');
                res.body.farms.should.all.have.property('animals');
                res.body.farms.should.all.have.property('permissions');
            });
        });

        it('should get farm by name', function(){

            return connection.get('/farms?name=' + dataSource.farm1.name).expect(200).then(function(res) {

                should.exist(res.body.farms);
                res.body.farms.should.not.be.empty;
                res.body.farms.length.should.equal(1);
                res.body.farms[0].name.should.equal(dataSource.farm1.name);
            });
        });

    });
});