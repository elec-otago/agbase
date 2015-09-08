var FarmController = agquire('ag/db/controllers/FarmController');
var UserController = agquire('ag/db/controllers/UserController');

describe('FarmController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');

    var testFarm;
    var testFarmName = dataSource.randomString(10);

    before(function(){
        return dataSource.setup();
    });


    describe('#createFarm()', function(){

        it('should create the specifed farm', function(){

            return FarmController.createFarm(testFarmName).then(function(farm) {
                should.exist(farm);
                testFarm = farm;
            });
        });

        it('should return existing farm', function(){

            return FarmController.createFarm(testFarmName).then(function(farm) {
                should.exist(farm);
                farm.id.should.equal(testFarm.id);
                farm.name.should.equal(testFarmName);
            });
        });

        it('should not create a nameless farm', function(){

            return FarmController.createFarm("")
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create a farm with null name', function(){

            return FarmController.createFarm(null)
                .should.be.rejectedWith(errors.ValidationError);
        });
    });


    describe('#getFarms()', function(){

        it('should retrieve all farms and contain the one we created', function(){

            return FarmController.getFarms().then(function(farms) {

                should.exist(farms);
                farms.should.contain.an.item.with.property('id', testFarm.id);

            });
        });
    });


    describe('#getFarm()', function(){

        it('should retrieve the farm we created', function(){

            return FarmController.getFarm(testFarm.id)
                .should.eventually.have.property('id', testFarm.id);
        });

        it('should retrieve the farm we created (by name)', function(){

            return FarmController.getFarm({where: {name: testFarm.name}})
                .should.eventually.have.property('id', testFarm.id);
        });
    });


    describe('#removeFarm()', function(){

        it('should remove the specified farm', function() {

            return FarmController.removeFarm(testFarm.id).then(function() {
                return FarmController.getFarms();
            }).then(function(farms) {
                should.exist(farms);
                farms.should.not.be.empty;
                farms.should.not.contain.an.item.with.property('id', testFarm.id);
            });

        });
    });
});