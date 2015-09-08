/**
 * algorithmController Tests
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

var dataSource = require('../dataSource');
var common = require('../common');
var AlgorithmController = agquire('ag/db/controllers/AlgorithmController');
var CategoryController = agquire('ag/db/controllers/MeasurementCategoryController');
var orm = agquire('ag/db/orm');
var forEach = agquire('ag/utils/forEachIn');

var dataSource = require('../dataSource');

var fakeAlgorithmCreated;
var fakeAlgorithmDetails =
{
    name   : "Marks Sweet Algorithm"
};

var testCategory, otherCategory;
var extraAlgorithm;

describe('AlgorithmController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){

        return dataSource.setup().then(function() {
            testCategory = dataSource.measurementCategory1;
            otherCategory = dataSource.measurementCategory2;
            extraAlgorithm = dataSource.measurementCategory1.algorithm1;
        });

    });

    describe('#createAlgorithm()', function() {

        //it('should probably fail because this is super dirty', function() {
        //    var algorithms = [];
        //    var categorynames = ['qjwgjbfwxg', 'ysskqiqnqu', 'MeasurementTestCategory'];
        //
        //    for (var x = 0; x < categorynames.length; x++) {
        //        algorithms.push({measurementCategoryName: categorynames[x], name: 'hello1' + x});
        //    }
        //
        //    return AlgorithmController.createMultipleAlgorithms(algorithms)
        //        .then(function(algorithms) {
        //            console.log(algorithms);
        //        })
        //        .catch(function(err) {
        //            console.log(err);
        //        });
        //
        //});

        it('should create the specified algorithm', function(){

            return AlgorithmController.createAlgorithm(testCategory.id, fakeAlgorithmDetails.name)
                .then(function(algorithm) {
                    should.exist(algorithm);

                    fakeAlgorithmCreated = algorithm;

                    algorithm.should.have.property('id');

                    algorithm.should.have.property('name', fakeAlgorithmDetails.name);

                    algorithm.should.have.property('measurementCategoryId', testCategory.id);
                });
        });

        it('should not create duplicate algorithm with the same name', function() {

            return AlgorithmController.createAlgorithm(testCategory.id, fakeAlgorithmDetails.name)
                .then(function(algorithm) {
                    should.exist(algorithm);
                    algorithm.id.should.equal(fakeAlgorithmCreated.id);
                    algorithm.measurementCategoryId.should.equal(fakeAlgorithmCreated.measurementCategoryId);
                    algorithm.name.should.equal(fakeAlgorithmCreated.name);
                });
        });


        it('should create duplicate algorithm name because the category is different', function(){

            return AlgorithmController.createAlgorithm(otherCategory.id, fakeAlgorithmDetails.name)
                .then(function(algorithm) {
                    fakeAlgorithmCreated.id.should.not.equal(algorithm.id);
                });
        });

        it('should not create with empty name', function(){

            return AlgorithmController.createAlgorithm(testCategory.id, "")
                .should.be.rejected;
        });

        it('should not create with null name', function(){

            return AlgorithmController.createAlgorithm(testCategory.id, null)
                .should.be.rejected;
        });
    });


    describe('#getAlgorithm()', function(){

        it('should retrieve the algorithm we created', function(){

            return AlgorithmController.getAlgorithm(fakeAlgorithmCreated.id)
                .then(function(algorithm) {
                    fakeAlgorithmCreated.id.should.equal(algorithm.id);
                }).should.be.fulfilled;
        });
        it('should not let us break referential integrity on category', function(){

            return AlgorithmController.updateAlgorithm(fakeAlgorithmCreated.id, {measurementCategoryId:-1})
                .should.be.rejected;
        });
        it('should not let us change the name to an empty string', function(){

            return AlgorithmController.updateAlgorithm(fakeAlgorithmCreated.id, {name:""})
                .should.be.rejected;
        });
    });

    describe('#Test relationship with measurement category', function(){

        it('should retrieve the algorithm when category is specified', function(){

           return AlgorithmController.getAlgorithms({where: {measurementCategoryId: testCategory.id}})
                .then(function(algorithms) {
                    algorithms.should.not.be.empty;
            });
        });
    });


    describe('#updateAlgorithm()', function(){

        it('should update the specified algorithm', function(){

            var updateDetails =
            {
                name: extraAlgorithm.name + 'UpdatedName',
                measurementCategoryId: null
            };


            return AlgorithmController.updateAlgorithm(extraAlgorithm.id, updateDetails)
                .then(function() {
                    return AlgorithmController.getAlgorithms({where: {name: updateDetails.name}});
                }).then(function(algorithms) {
                    should.exist(algorithms);
                    algorithms.length.should.equal(1);
                    algorithms[0].id.should.equal(extraAlgorithm.id);
                    algorithms[0].name.should.equal(updateDetails.name);
                    if (updateDetails.measurementCategoryId != null) {
                        algorithms[0].measurementCategoryId.should.equal(updateDetails.measurementCategoryId);
                    }
                });
        });

    });


    describe('#removeAlgorithm()', function(){

        it('should remove the specified algorithm', function(){

            return AlgorithmController.removeAlgorithm(fakeAlgorithmCreated.id)
                .then(function() {
                    return AlgorithmController.getAlgorithms();
                }).then(function(algorithms) {
                    algorithms.should.not.contain.an.item.with.property('id', fakeAlgorithmCreated.id);
                });

        });


        //it('should remove associated measurements');

    });


    describe('#Test relationship with category after delete', function() {

        it('deleted algorithm should not be accessible', function () {

            return AlgorithmController.getAlgorithms({where: {measurementCategoryId: testCategory.id}})
                .then(function (algorithms) {
                    algorithms.should.not.contain.an.item.with.property('id',fakeAlgorithmCreated.id);
                });
        });
    });

    after(function(){

        return CategoryController.removeMeasurementCategory(testCategory.id);
    });

});