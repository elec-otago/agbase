var PaddockController = agquire('ag/db/controllers/PaddockController');
var FarmController = agquire('ag/db/controllers/FarmController');


describe('PaddockController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');

    var testFarm;

    before(function(){
        return dataSource.setup().then(function() {
            testFarm = dataSource.farm1;

        });
    });


    describe('#createPaddock()', function(){

        var testPaddock;

        it('should create the specifed paddock', function(){

            var paddockDetails = {
                farm_id: testFarm.id,
                name: "Test Paddock",
                loc: {
                    coordinates: [[
                        [0,0],[0,1],[1,1],[1,0],[0,0]
                    ]]
                }
            };

            return PaddockController.createPaddock(paddockDetails).then(function(paddock){

                should.exist(paddock);

                testPaddock = paddock;

            });
        });


        it('should not create the specifed paddock with no boundaries', function(){

            var paddock = {
                farm_id: testFarm.id,
                name: "Test Paddock"               
            };
            
            return PaddockController.createPaddock(paddock).should.be.rejectedWith(errors.ValidationError);
        });


        afterEach(function(){

            if(! testPaddock){
                return Promise.resolve();
            }

            return PaddockController.deletePaddock(testPaddock.id);
        });

    });

});