describe('MeasurementRestAPI', function(){

    var algorithmId;
    var agAPI = require('./utils/agAPI');
    var connection = agAPI.newConnection();

    var dataSource = require('../dataSource');

    before(function(){
        return connection.loginAsTest().then(function () {
            return dataSource.setup();
        }).then(function() {
            algorithmId = dataSource.measurementCategory1.algorithm1.id;
        });
    });

    describe('#create measurements and animals', function(){

        var createdAnimalId;

        it('should create a measurement and animal at the same time', function(){

            return connection.post('/measurements', {
                eid: 'unittest-aneid-66787',
                vid: 'unittest-555',
                farmId: dataSource.farm1.id,
                herdId: dataSource.farm1.herd1.id,
                algorithmId: algorithmId,
                w25: 666,
                timeStamp: new Date(),
                comment: 'A comment'
            }).expect(200)
                .then(function(res) {
                    should.exist(res.body);

                    res.body.should.contain.property('measurement');
                    res.body.measurement.should.contain.property('algorithmId', algorithmId);
                    res.body.measurement.should.contain.property('w25', 666);

                    createdAnimalId = res.body.measurement.animalId;
                });
        });
    });

    describe('#get measurements', function(){

        it('should get all measurements', function(){

            return connection.get('/measurements?farm=' + dataSource.farm1.id)
                .expect(200)
                .then(function(res) {

                    should.exist(res.body.measurements);
                    res.body.measurements.should.not.be.empty;

                    res.body.measurements.should.all.have.property('id');
                    res.body.measurements.should.all.have.property('w05');
                    res.body.measurements.should.all.have.property('w25');
                    res.body.measurements.should.all.have.property('w50');
                    res.body.measurements.should.all.have.property('w75');
                    res.body.measurements.should.all.have.property('w95');
                    res.body.measurements.should.all.have.property('userId');
                    res.body.measurements.should.all.have.property('algorithmId');
                    res.body.measurements.should.all.have.property('animalId');
                    res.body.measurements.should.all.have.property('timeStamp');
                });
        });

        it('should get all measurements and include animal', function(){

            return connection.get('/measurements?include=animal&farm=' + dataSource.farm1.id).then(function(res) {
                res.statusCode.should.equal(200);
                should.exist(res.body.measurements);
                res.body.measurements.should.not.be.empty;

                res.body.measurements.should.all.have.property('animal');
            });
        });


        it('should get all measurements and include everything', function(){

            return connection.get('/measurements?include=animal,user,algorithm&farm=' + dataSource.farm1.id).then(function(res) {
                res.statusCode.should.equal(200);
                should.exist(res.body.measurements);
                res.body.measurements.should.not.be.empty;

                res.body.measurements.should.all.have.property('animal');
                res.body.measurements.should.all.have.property('user');
                res.body.measurements.should.all.have.property('algorithm');
            });
        });

        it('should get all measurements in data range', function(){

            var startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate = startDate.getTime();

            var endDate = new Date().getTime();

            var query = {
                farm: dataSource.farm1.id,
                startDate: startDate,
                endDate: endDate
            };

            return connection.get('/measurements', query)
                .expect(200)
                .then(function(res) {
                    should.exist(res.body.measurements);
                    res.body.measurements.should.not.be.empty;
                });
        });
    });
});