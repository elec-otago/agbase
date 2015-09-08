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


describe('UsageTierRestAPI', function(){

    var dataSource = require('../dataSource');
    var agAPI = require('./utils/agAPI');

    var connection = agAPI.newConnection();

    before(function(){

        return connection.loginAsTest().then(function(){

            return dataSource.setup();
        });

    });

    describe('#get usage tiers', function(){

        it('should get all usage tiers', function(){

            return connection.get('/usage-tiers').expect(200).then(function(res){

                should.exist(res.body.tiers);

                res.body.tiers.should.not.be.empty;

                res.body.tiers.should.all.have.property('id');
                res.body.tiers.should.all.have.property('name');
                res.body.tiers.should.all.have.property('dailyRequests');
            });
        });
    });
});