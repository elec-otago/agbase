var HerdController = agquire('ag/db/controllers/HerdController');
var FarmController = agquire('ag/db/controllers/FarmController');

var fakeHerdCreated;
var fakeHerdDetails;
var testFarm;
var farmToRemoveFrom;

describe('HerdController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){
        return dataSource.setup().then(function() {
            testFarm = dataSource.farm1;
            farmToRemoveFrom = dataSource.farm2;

            should.exist(testFarm);
        });
    });

    describe('#createHerd()', function(){

        it('should create the specified herd', function(){

            var name = dataSource.randomString(10);
            return HerdController.createHerd(testFarm.id, name)
                .then(function(herd) {

                    should.exist(herd);
                    fakeHerdCreated = herd;
                    herd.should.have.property('id');
                    herd.should.have.property('name', name);
                    herd.should.have.property('farmId', testFarm.id);
                });
        });

        it('should not create the specified herd', function(){

            return HerdController.createHerd(null, fakeHerdDetails)
                .should.be.rejectedWith(errors.ValidationError);
        });


        it('should not create the specified herd with bad farm id', function(){

            return HerdController.createHerd(213443, fakeHerdDetails)
                .should.be.rejectedWith(errors.ValidationError);
        });


        it('should not create the specified herd with incorrect details', function(){

            return HerdController.createHerd(testFarm.id, {honk: 'goose'})
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified herd with bad name', function(){

            return HerdController.createHerd(testFarm.id, {name: 23 })
                .should.be.rejectedWith(errors.ValidationError);
        });
    });


    describe('#getHerd()', function(){

        it('should retrieve the herd we created', function(){

            return HerdController.getHerd(fakeHerdCreated.id)
                .should.eventually.have.property('id', fakeHerdCreated.id);
        });
    });


//    describe('#updateHerd()', function(){
//
//        it('should update the specified herd');
//
//    });


    describe('#removeHerd()', function(){

        it('should remove the specified herd', function(){

            return HerdController.removeHerd(dataSource.farm1.herd1.id)
                .then(function() {
                    return HerdController.getHerds();
                }).then(function(herds) {
                    herds.should.not.be.empty;
                    herds.should.not.contain.an.item.with.property('id', dataSource.farm1.herd1.id);
                });
        });


        //it('should remove associated measurements');

    });


    describe('#TestRelationshipWithFarm', function(){

        //var testHerd;
        //var testFarm;
        //
        //beforeEach(function(done){
        //
        //    FarmController.createFarm("HerdTestFarm", function(err, farm){
        //
        //        testFarm = farm;
        //
        //        HerdController.createHerd(farm.id, 'testRelHerd', function(err, herd){
        //            testHerd = herd;
        //
        //            done();
        //        });
        //    });
        //});
        //
        //
        //afterEach(function(done){
        //
        //    HerdController.removeHerd(testHerd.id, function(err){
        //
        //        FarmController.removeFarm(testFarm.id, function(err){
        //
        //            done();
        //        });
        //    });
        //});


        it('Should retrieve the herd from the farm', function(){

            return HerdController.getHerds({where: {farmId: testFarm.id}})
                .then(function(herds) {
                    herds.should.not.be.empty;
                    herds.should.contain.an.item.with.property('id', fakeHerdCreated.id);
                });
        });

        it('should not remove the farm when the herd is removed', function(){

            should.exist(farmToRemoveFrom.herd1);

            return HerdController.removeHerd(farmToRemoveFrom.herd1.id)
                .then(function() {
                    return FarmController.getFarm(farmToRemoveFrom.id);
                }).should.eventually.have.property('id', farmToRemoveFrom.id);
        });


        it('should remove the herd when its farm is removed', function(){

            return FarmController.removeFarm(testFarm.id)
                .then(function() {
                    return HerdController.getHerd(fakeHerdCreated.id);
                })
                .should.be.rejectedWith(errors.NoResultError);
        });






        //it('should remove associated measurements');

    });
});