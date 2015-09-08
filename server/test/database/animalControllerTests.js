var AnimalController = agquire('ag/db/controllers/AnimalController');
var FarmController = agquire('ag/db/controllers/FarmController');
var HerdController = agquire('ag/db/controllers/HerdController');

describe('AnimalController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){
        return dataSource.setup().then(function() {
            testFarm = dataSource.farm1;
            otherFarm = dataSource.farm2;
            testHerd = testFarm.herd1;
            otherHerd = testFarm.herd2;
        });
    });

    var fakeAnimalCreated;
    var fakeAnimalDetails = {
        eid: dataSource.randomString(10)
    };

    var testFarm;
    var otherFarm;
    var testHerd;
    var extraAnimal;
    var otherHerd;


    describe('#createAnimal()', function(){

        it('should create the specified animal', function(){

            return AnimalController.createAnimal(testFarm.id, testHerd.id, fakeAnimalDetails.eid, null).then(function(animal){

                should.exist(animal);

                fakeAnimalCreated = animal;

                animal.should.have.property('id');

                animal.should.have.property('eid', fakeAnimalDetails.eid);

                animal.should.have.property('farmId', testFarm.id);

                animal.should.have.property('herdId', testHerd.id);
            });
        });

        it('should not create the specified animal with no farm', function(){

            return AnimalController.createAnimal(null, testHerd.id, 'this eid would be fine112', null)
                .should.be.rejectedWith(errors.ValidationError);
        });


        it('should not create the specified animal with the same eid on same farm', function(){

            return AnimalController.createAnimal(testFarm.id, testHerd.id, fakeAnimalDetails.eid, null)
                .should.be.rejectedWith(errors.UniqueConstraintError);
        });

        it('should not create the specified animal with the same eid on different farm', function(){

            return AnimalController.createAnimal(dataSource.farm2.id, null, fakeAnimalDetails.eid, null)
                .should.be.rejectedWith(errors.UniqueConstraintError);
        });

        it('should not create the specified animal with no eid/vid', function(){

            return AnimalController.createAnimal(testFarm.id, testHerd.id, null, null)
                .should.be.rejectedWith(errors.ValidationError, 'Must provide eid or vid');
        });

        it('should not create the specified animal with bad herd', function(){

            return AnimalController.createAnimal(testFarm.id, 'goose', 'eid', 'vid')
                .should.be.rejected;
        });

        it('should not create the specified animal because herd is not related to farm', function() {
            return AnimalController.createAnimal(dataSource.farm1.id, dataSource.farm2.herd1.id,
                dataSource.randomString(10), dataSource.randomString(10))
                .should.be.rejectedWith(errors.ValidationError, 'animal and herd on different farms');
        });


        it('should create a new animal because eid doesnt exist', function() {

            var eid = dataSource.randomString(10);

            return AnimalController.getOrCreateAnimal(null, testFarm.id, null, eid, null).then(function(animal) {
                extraAnimal = animal;
                should.exist(animal);
                animal.farmId.should.equal(testFarm.id);
                animal.eid.should.equal(eid);
            });
        });
    });


    describe('#getAnimal()', function(){

        it('should retrieve the animal we created with an implicit query', function(){

            return AnimalController.getAnimal(fakeAnimalCreated.id)
                .then(function(animal) {
                    fakeAnimalCreated.id.should.equal(animal.id);
                });
        });

        it('should retrieve the animal we created with an explicit query', function(){

            return AnimalController.getAnimal({where: {id: fakeAnimalCreated.id}})
                .then(function(animal) {
                    fakeAnimalCreated.id.should.equal(animal.id);
                });
        });

        it('should retrieve the animal from its farm and eid', function() {
            return AnimalController.getOrCreateAnimal(null, testFarm.id, null, fakeAnimalDetails.eid, null).then(function(animal) {
                should.exist(animal);
                animal.id.should.equal(fakeAnimalCreated.id);
            });
        });
    });


    describe('#Test relationship with herd and farm', function(){

        it('should retrieve the animal when herd is specified', function(){

            return AnimalController.getAnimals({where: {herdId: testHerd.id}}).then(function(animals){
                animals.should.not.be.empty;
                animals.should.contain.an.item.with.property('id', fakeAnimalCreated.id);
            });
        });


        it('should retrieve the animal when farm is specified', function(){

            return AnimalController.getAnimals({where: {farmId: testFarm.id}})
                .bind({})
                .then(function(animals){
                    this.animals = animals;
                    animals.should.not.be.empty;

                    return FarmController.getFarm({where: {id: testFarm.id}, include: ['animals']});
                }).then(function(farm) {
                    farm.animals.should.not.be.empty;
                    farm.animals.length.should.equal(this.animals.length);
                });
        });
    });

    describe('#updateAnimal()', function(){

        var currentHerd;

        it('should update the specified animal with new vid', function(){

            var oldVid = fakeAnimalCreated.vid;
            var testVid = 'X123';
            currentHerd = fakeAnimalCreated.herdId;

            // TODO should use transactions at some point

            return AnimalController.updateAnimal(fakeAnimalCreated.id, {vid: testVid})
                .then(function(animal) {
                    should.exist(animal);
                    animal.vid.should.equal(testVid);

                    return AnimalController.getAnimal(fakeAnimalCreated.id);
                }).then(function(animal) {
                    animal.vid.should.equal(testVid);
                    animal.id.should.equal(fakeAnimalCreated.id);

                    fakeAnimalCreated = animal;
                });
        });


        it('should update the herd that the animal belongs to', function(){

            var updateDetails = {herdId:otherHerd.id};

            return AnimalController.updateAnimal(fakeAnimalCreated.id, updateDetails).then(function(animal) {
                animal.herdId.should.equal(updateDetails.herdId);

                return AnimalController.getAnimals({where: {herdId: otherHerd.id}});
            }).then(function(animals) {
                var found = false;
                forEach(animals, function(animal) {
                    if (animal.id == fakeAnimalCreated.id) {
                        fakeAnimalCreated = animal;
                        found = true;
                    }
                });

                currentHerd = fakeAnimalCreated.herdId;

                found.should.equal(true);
            });
        });

        it('should not let me update to herd in another farm', function() {
            dataSource.farm2.herd1.id.should.exist;
            return AnimalController.updateAnimal(fakeAnimalCreated.id, {herdId: dataSource.farm2.herd1.id})
                .should.be.rejectedWith(errors.ValidationError, 'animal and herd on different farms');
        });


        it('it should not remove the animal when the herd is removed', function(){

            return HerdController.removeHerd(currentHerd)
                .then(function() {
                   return AnimalController.getAnimal(fakeAnimalCreated.id);
                }).then(function(animal) {
                    should.not.exist(animal.herdId);
                });
        });
    });


    describe('#removeAnimal()', function(){

        var removeTestAnimal;

        before(function(){

            return AnimalController.createAnimal(testFarm.id, null, dataSource.randomString(10), null).then(function(animal){

                removeTestAnimal = animal;
            });
        });


        it('should remove the specified animal', function(){

            return AnimalController.removeAnimal(removeTestAnimal.id).then(function() {
                return AnimalController.getAnimals();
            }).then(function(animals) {
                forEach(animals, function(animal) {
                    animal.id.should.not.equal(removeTestAnimal.id);
                    animal.eid.should.not.equal(removeTestAnimal.eid);
                });
            });
        });
    });


    describe('#Test relationship with farm when deleting', function(){

        it('should delete the animal when the farm is deleted', function(){

            should.exist(otherFarm.animal1);

            var animal = otherFarm.animal1.id;

            should.exist(animal);

            return FarmController.removeFarm(otherFarm.id).then(function() {
                return AnimalController.getAnimal(animal);
            }).should.be.rejectedWith(errors.NoResultError);
        });
    });
});