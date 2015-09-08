/**
 * /animal Route Tests
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




describe('AnimalRestAPI', function(){

    var dataSource = require('../dataSource');
    var agAPI = require('./utils/agAPI');

    var connection = agAPI.newConnection();

    before(function(){

        return dataSource.setup().then(function(){

            console.log("setup data source");

            return connection.loginAsTest();
        });
    });


    describe('#get animals', function(){

        it('should get all animals', function(){
            return connection.get('/animals?limit=100').expect(200).then(function(res) {

                should.exist(res.body.animals);
                // dataSource ensures we always have some animals
                res.body.animals.should.not.be.empty;
                res.body.animals.should.all.have.property('id');
                res.body.animals.should.all.have.property('farmId');
            });
        });

        it('should get all animals and include herd', function(){
            return connection.get('/animals/?limit=100&include=herd').expect(200).then(function(res){

                should.exist(res.body.animals);

                res.body.animals.should.not.be.empty;
                res.body.animals.should.all.have.property('id');
                res.body.animals.should.all.have.property('farmId');
                res.body.animals.should.all.have.property('herd');
            });
        });

        it('should get all animals and include farm', function(){
            return connection.get('/animals/?limit=100&include=farm').expect(200).then(function(res){

                should.exist(res.body.animals);

                res.body.animals.should.not.be.empty;
                res.body.animals.should.all.have.property('id');
                res.body.animals.should.all.have.property('farmId');
                res.body.animals.should.all.have.property('farm');
            });
        });

        it('should get all animals and include measurement', function(){
            return connection.get('/animals/?limit=100&include=measurements').expect(200).then(function(res){

                should.exist(res.body.animals);

                res.body.animals.should.not.be.empty;
                res.body.animals.should.all.have.property('id');
                res.body.animals.should.all.have.property('farmId');
                res.body.animals.should.all.have.property('measurements');
            });
        });

        it('should get all animals and include everything', function(){
            return connection.get('/animals/?limit=100&include=farm,herd,measurements').expect(200).then(function(res){

                should.exist(res.body.animals);

                res.body.animals.should.not.be.empty;
                res.body.animals.should.all.have.property('id');
                res.body.animals.should.all.have.property('farmId');
                res.body.animals.should.all.have.property('measurements');
                res.body.animals.should.all.have.property('farm');
                res.body.animals.should.all.have.property('herd');
            });
        });
    });


    describe('#merge animals', function(){

        it('should merge source animal into dest animal', function() {

            var sourceAnimal = dataSource.farm1.animal2;
            var destAnimal = dataSource.farm1.animal1;

            var putData = {sourceAnimalId: sourceAnimal.id};

            return connection.put('/animals/' + destAnimal.id, putData).expect(200).then(function (res) {

                should.exist(res.body.animal);
                res.body.animal.should.contain.property('id', destAnimal.id);
                res.body.animal.should.contain.property('vid', sourceAnimal.vid);
                res.body.animal.should.contain.property('eid', destAnimal.eid);

                if (sourceAnimal.herdId) {
                    res.body.animal.should.contain.property('herdId', sourceAnimal.herdId);
                }

                //check source animal has been deleted
                return connection.get('/animals/' + sourceAnimal).expect(422);

            });
        });
    });
});