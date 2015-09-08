var MeasurementController = agquire('ag/db/controllers/MeasurementController');
var FarmController = agquire('ag/db/controllers/FarmController');
var AnimalController = agquire('ag/db/controllers/AnimalController');
var CategoryController = agquire('ag/db/controllers/MeasurementCategoryController');
var UserController = agquire('ag/db/controllers/UserController');
var AlgorithmController = agquire('ag/db/controllers/AlgorithmController');
var HerdController = agquire('ag/db/controllers/HerdController');
var Promise = agquire('ag/wowPromise');

/*
* Measurements are directly related to the following:
* - Algorithm
* - Animal
* - User
 */

var testAnimal;
var testAnimalInHerd;
var testFarm;
var otherFarm;
var testHerd;
var testUser;
var testCategory;
var testAlgorithm;
var testMeasurement;
var measurementForTestAnimal, measurementForAnimalInHerd;

var measurementDetails =
{
    w05: '123.56',
    w25: '3.56',
    w50: '3.56',
    w75: '3.7',
    w95: '7.9',
    timeStamp: new Date(),
    comment: 'Look at my measurement'
};

describe('MeasurementController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){

        return dataSource.setup().then(function() {
            testFarm = dataSource.farm1;
            otherFarm = dataSource.farm2;
            testAlgorithm = dataSource.measurementCategory1.algorithm1;
            testUser = dataSource.demoUser;
            testAnimal = dataSource.farm1.animal1;
            testHerd = dataSource.farm1.herd1;
            testAnimalInHerd = testHerd.animal1;

            should.exist(testFarm);
            should.exist(testAlgorithm);
            should.exist(testUser);
        });
    });


    describe('#createMeasurement()', function(){

        it('should create the specified measurement with only an eid supplied (new animal)', function(){

            var eid = dataSource.randomString(10);
            return MeasurementController.createMeasurement({eid: eid}, testFarm.id, testAlgorithm.id, testUser.id, measurementDetails)
                .then(function (measurement) {

                    should.exist(measurement);
                    testMeasurement = measurement;

                    measurement.should.have.property('algorithmId', testAlgorithm.id);
                    measurement.should.have.property('timeStamp').deep.equal(measurementDetails.timeStamp);
                    measurement.should.have.property('userId', testUser.id);

                    return AnimalController.getAnimal({where: {eid: eid}});
                }).then(function(animal) {
                    should.exist(animal);
                    animal.eid.should.equal(eid);
                });
        });

        it('should create measurement with unix timestamp', function() {
            var now = new Date();

            return MeasurementController.createMeasurement({eid: dataSource.randomString(10)}, testFarm.id, testAlgorithm.id, testUser.id, {
                w05: '123.56',
                w25: '3.56',
                w50: '3.56',
                w75: '3.7',
                w95: '7.9',
                timeStamp: now.getTime(),
                comment: 'Look at my measurement'
            }).then(function (measurement) {

                should.exist(measurement);

                measurement.should.have.property('timeStamp').deep.equal(now);
            });
        });

        it('should not create measurement with bad timestamp', function() {
            return MeasurementController.createMeasurement({eid: dataSource.randomString(10)}, testFarm.id, testAlgorithm.id, testUser.id, {
                w05: '123.56',
                w25: '3.56',
                w50: '3.56',
                w75: '3.7',
                w95: '7.9',
                timeStamp: "this will fail",
                comment: 'Look at my measurement'
            }).should.be.rejectedWith(errors.ValidationError, 'timeStamp invalid');
        });


        it('should create measurement, new animal, and put animal in the herd', function() {
            var eid = dataSource.randomString(8);
            return MeasurementController.createMeasurement({eid: eid, herdId: testFarm.herd1.id}, testFarm.id, testAlgorithm.id, testUser.id, measurementDetails)
                .then(function(measurement) {
                    should.exist(measurement);
                    return AnimalController.getAnimal(measurement.animalId);
                }).then(function(animal) {
                    should.exist(animal);
                    animal.herdId.should.equal(testFarm.herd1.id);
                });
        });

        it('should not create measurement, new animal and put in herd because herd is not in farm', function() {
            var eid = dataSource.randomString(8);
            return MeasurementController.createMeasurement({eid: eid, herdId: otherFarm.herd1.id}, testFarm.id, testAlgorithm.id, testUser.id, measurementDetails)
                .should.be.rejectedWith(errors.ValidationError, 'animal and herd on different farms');
        });

        it('should not create the specified measurement with no eid', function(){

            return MeasurementController.createMeasurement(testFarm.id, testAlgorithm.id, testUser.id, {}, measurementDetails)
                .should.be.rejectedWith(errors.ValidationError, 'no animal info supplied');
        });


        it('should create the specified measurement with animal supplied by id without farm', function(){

            return MeasurementController.createMeasurement({animalId: testAnimal.id}, null, testAlgorithm.id, testUser.id, measurementDetails)
                .then(function(measurement) {
                    should.exist(measurement);

                    measurementForTestAnimal = measurement;

                    measurement.should.have.property('algorithmId', testAlgorithm.id);
                    measurement.should.have.property('userId', testUser.id);
                    measurement.should.have.property('animalId', testAnimal.id);
                });
        });

        it('should create the specified measurement for animal with herd', function(){

            return MeasurementController.createMeasurement({animalId: testAnimalInHerd.id}, testFarm.id, testAlgorithm.id, testUser.id, measurementDetails)
                .then(function(measurement) {
                    should.exist(measurement);

                    measurementForAnimalInHerd = measurement;

                    measurement.should.have.property('algorithmId', testAlgorithm.id);
                    measurement.should.have.property('userId', testUser.id);
                    measurement.should.have.property('animalId', testAnimalInHerd.id);
                });
        });

        it('should create multiple measurements fine', function(){

            return MeasurementController.createMeasurementsForAnimal(
                {eid: 'some sweet eid'}, testFarm.id, testAlgorithm.id, testUser.id,
                [measurementDetails, measurementDetails])
                .then(function(measurements) {
                    should.exist(measurements);
                    measurements.length.should.equal(2);
                });

        });
    });


    describe('#getMeasurement()', function(){

        it('should retrieve the measurement we created', function(){

            should.exist(testMeasurement);

            return MeasurementController.getMeasurement(testMeasurement.id)
                .should.eventually.have.property('id', testMeasurement.id);
        });
    });

    //TODO: improve these tests
    describe('#getMeasurements() Test relationship when getting measurements', function(){

        it('should retrieve the Measurement when Algorithm is specified', function(){

            return MeasurementController.getMeasurements({where: {algorithmId: testAlgorithm.id}}).then(function(measurements){

                measurements.length.should.be.above(0);
                measurements.should.contain.an.item.with.property('id', testMeasurement.id);
            });
        });


        it('should retrieve the Measurement when Animal is specified', function(){

            return MeasurementController.getMeasurements({where: {animalId: testAnimal.id}}).then(function(measurements){

                measurements.length.should.be.above(0);
                measurements.should.contain.an.item.with.property('id', measurementForTestAnimal.id);
                measurements.should.not.contain.an.item.with.property('id', testMeasurement.id);
            });
        });


        it('should retrieve the Measurement when User is specified', function(){

            return MeasurementController.getMeasurements({where: {userId: testUser.id}}).then(function(measurements){

                measurements.length.should.be.above(0);
                measurements.should.contain.an.item.with.property('id', testMeasurement.id);

            });
        });

        it('should retrieve the Measurement when Herd is specified', function(){

            return MeasurementController.getMeasurements({where: {'animal.herdId': testHerd.id}}).then(function(measurements){

                should.exist(measurements);

                measurements.length.should.be.above(0);
                measurements.should.contain.an.item.with.property('id', measurementForAnimalInHerd.id);
            });
        });

        it('should retrieve the Measurement when Herd is specified with animal', function(){

            return MeasurementController.getMeasurements({
                where: {'animal.herdId': testHerd.id},
                include: ['animal']
            }).then(function(measurements) {
                should.exist(measurements);

                measurements.length.should.be.above(0);
                measurements.should.all.have.property('animal');

                forEach(measurements, function(measurement) {
                    measurement.animal.herdId.should.equal(testHerd.id);
                });
            });
        });

        it('should retrieve the Measurements when Farm is specified', function(){

            return MeasurementController.getMeasurements({where: {farmId: testFarm.id}}).then(function(measurements){

                should.exist(measurements);
                measurements.should.not.be.empty;
                // we haven't included it so it shouldn't be here.
                measurements.should.all.have.property('animal', undefined);

                var animalIds = [];
                forEach(measurements, function(measurement) {
                   animalIds.push(measurement.animalId);
                });

                return AnimalController.getAnimals({where: {id: {in: animalIds}}});
            }).then(function(animals) {
                should.exist(animals);
                animals.should.not.be.empty;
                animals.should.all.have.property('farmId', testFarm.id);
            });
        });

        it('should retrieve the Measurement when Farm is specified with animal', function(){

            return MeasurementController.getMeasurements({
                where: {farmId: testFarm.id},
                include: ['animal']
            }).then(function(measurements){

                measurements.should.not.be.empty;
                measurements.should.all.have.property('animal');

                forEach(measurements, function(measurement) {
                    measurement.animal.should.have.property('farmId', testFarm.id);
                });

            });
        });

        it('should retrieve the Measurements when Farm and Herd is specified', function(){

            return MeasurementController.getMeasurements({where: {farmId: testFarm.id,'animal.herdId': testHerd.id}})
                .then(function(measurements){
                    should.exist(measurements);
                    measurements.should.not.be.empty;
                    // we haven't included it so it shouldn't be here.
                    measurements.should.all.have.property('animal', undefined);

                    var animalIds = [];
                    forEach(measurements, function(measurement) {
                        animalIds.push(measurement.animalId);
                    });

                    return AnimalController.getAnimals({where: {id: {in: animalIds}}});
                }).then(function(animals) {
                    should.exist(animals);
                    animals.should.not.be.empty;
                    animals.should.all.have.property('farmId', testFarm.id);
                    animals.should.all.have.property('herdId', testHerd.id);
                });
        });


        it('should retrieve the Measurements with animals without herd/farm predicates', function() {
            return MeasurementController.getMeasurements({include: ['animal']}).then(function(measurements){

                measurements.should.not.be.empty;
                measurements.should.all.have.property('animal');

            });
        });


        it('should retrieve the Measurements with timestamp range', function() {
            return MeasurementController.getMeasurements({where: {timeStamp: {$gte: measurementDetails.timeStamp}}}).then(function(measurements){

                measurements.should.not.be.empty;
                measurements.should.contain.an.item.with.property('id', testMeasurement.id);
            });
        });

    });

    describe('#removeMeasurement()', function(){

        it('should remove the specified measurement', function(){

            return MeasurementController.removeMeasurement(testMeasurement.id).then(function() {

                return MeasurementController.getMeasurements();
            }).then(function(measurements) {
                measurements.should.not.be.empty;
                measurements.should.all.not.have.property('id', testMeasurement.id);
            });
        });
    });


    describe('#Test relationships when deleting', function(){

        it('should delete measurement when algorithm is deleted', function(){

            var measurementShouldBeRemoved;
            return MeasurementController.createMeasurement({eid: dataSource.randomString(5)}, testFarm.id,
                dataSource.measurementCategory1.algorithm1.id, testUser.id, measurementDetails)
                .then(function(measurement) {
                    measurementShouldBeRemoved = measurement;

                    return AlgorithmController.removeAlgorithm(dataSource.measurementCategory1.algorithm1.id);
                }).then(function() {
                    return MeasurementController.getMeasurement(measurementShouldBeRemoved.id);
                }).should.be.rejectedWith(errors.NoResultError);
        });


        it('should delete measurement when animal is deleted', function(){

            var measurementShouldBeRemoved;
            return MeasurementController.createMeasurement({animalId: testFarm.animal1.id}, testFarm.id,
                dataSource.measurementCategory1.algorithm2.id, testUser.id, measurementDetails)
                .then(function(measurement) {
                    measurementShouldBeRemoved = measurement;

                    return AnimalController.removeAnimal(testFarm.animal1.id);
                }).then(function() {
                    return MeasurementController.getMeasurement(measurementShouldBeRemoved.id);
                }).should.be.rejectedWith(errors.NoResultError);
        });


        var measurementShouldNotBeRemoved;
        it('should not delete measurement when user is deleted', function(){
            return MeasurementController.createMeasurement({animalId: testFarm.animal2.id}, testFarm.id,
                dataSource.measurementCategory1.algorithm2.id, testUser.id, measurementDetails)
                .then(function(measurement) {
                    measurementShouldNotBeRemoved = measurement;
                    return UserController.removeSingleUser(testUser.id);
                }).then(function() {
                    return MeasurementController.getMeasurement(measurementShouldNotBeRemoved.id);
                }).then(function(measurement) {
                   measurement.should.have.property('id', measurementShouldNotBeRemoved.id);
                });
        });
    });

    describe('#findRecentMeasurements', function(){

        var recent1 = [], recent2 = [], all = [];
        var recent1Count = 2000, recent2Count = 20;
        // 12 hours from now so we can get a decent window
        var recent1Epoch = new Date().getTime() + (12 * 60 * 60 * 1000);
        var recent2Epoch = new Date().getTime() + (8 * 60 * 60 * 1000);

        var combinedWindow = (recent1Epoch + (recent1Count * 1000) - recent2Epoch) / 60000;

        before(function() {


            for (var x = 0; x < recent1Count; x++) {
                recent1.push({
                    w05: '123.56',
                    timeStamp: recent1Epoch + (x * 1000) // second increments
                });
            }

            for (x = 0; x < recent2Count; x++) {
                recent2.push({
                    w05: '123.56',
                    timeStamp: recent2Epoch + (x * 1000) // second increments
                });
            }

            all = recent1.concat(recent2);

            return MeasurementController.createMeasurementsForAnimal({
                eid: 'some sweet eid'
            }, testFarm.id, dataSource.measurementCategory2.algorithm1.id, dataSource.wizardUser.id, all)
                .should.eventually.have.property('length', all.length);
        });

        it('window should be 2000 long', function(){
            return MeasurementController.findRecentMeasurements({where: {farmId: testFarm.id}}, 60)
                .should.eventually.have.property('count', recent1Count);

        });

        it('window should be 2020 long', function(){
            return MeasurementController.findRecentMeasurements({where: {farmId: testFarm.id}}, combinedWindow)
                .should.eventually.have.property('count', all.length);

        });

        it('window should be 20 long', function(){
            return MeasurementController.findRecentMeasurements({where: {farmId: testFarm.id, timeStamp: {$lt: new Date(recent1Epoch)}}}, 1)
                .should.eventually.have.property('count', recent2Count);

        });

        it('should retrieve two windows', function() {
            return MeasurementController.findRecentMeasurements({where: {farmId: testFarm.id}}, 60, 2)
                .then(function(windows) {
                    windows.should.have.property('length', 2);

                    windows[0].should.have.property('count', recent1Count);
                    windows[1].should.have.property('count', recent2Count);
                });
        });

        it('should handle 0 limit requests sensibly', function() {
            return MeasurementController.findRecentMeasurements({where: {farmId: testFarm.id}}, 60, 0)
                .should.be.rejectedWith(errors.NoResultError);
        });
    });
});