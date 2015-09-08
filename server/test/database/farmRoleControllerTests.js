var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');
var orm = agquire('ag/db/orm');

var fakeRoleCreated;
var fakeRoleDetails;

describe('FarmRoleController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){
        return dataSource.setup().then(function() {
            fakeRoleDetails = {
                name: dataSource.randomString(10),
                editFarmPermissions: false,
                viewFarmPermissions: false,
                editFarmHerds: false,
                viewFarmHerds: false,
                editFarmAnimals: false,
                viewFarmAnimals: false,
                editFarmMeasurements: false,
                viewFarmMeasurements: false,
                inviteUsers: false
            };
        });
    });

    describe('#createFarmRole()', function(){

        it('should create the specified role', function(){

            var rolesToCreate = [fakeRoleDetails];
            return FarmRoleController.createFarmRoles(rolesToCreate).then(function(roles) {

                should.exist(roles);
                roles.length.should.equal(rolesToCreate.length);

                fakeRoleCreated = roles[0];
            });
        });


        it('should not create the specified role (1)', function(){

            return FarmRoleController.createFarmRoles(null)
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified role (2)', function(){

            return FarmRoleController.createFarmRoles("")
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified role (3)', function(){

            return FarmRoleController.createFarmRoles([""])
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified role (4)', function(){

            return FarmRoleController.createFarmRoles([null])
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified role (5)', function(){

            return FarmRoleController.createFarmRoles([{test: 'test'}])
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified role because it has no permissions', function(){

            return FarmRoleController.createFarmRoles([{name: dataSource.randomString(5)}])
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create a new role with duplicate name', function(){

            return FarmRoleController.createFarmRoles([fakeRoleDetails]).then(function(roles) {
                should.exist(roles);
                roles.should.contain.an.item.with.property('id', fakeRoleCreated.id);
                roles[0].dataValues.should.deep.equal(fakeRoleCreated.dataValues);
            });
        });
    });


    describe('#getRole()', function(){

        it('should retrieve the role we created', function(){

            return FarmRoleController.getFarmRole(fakeRoleCreated.id)
                .should.eventually.have.property('id', fakeRoleCreated.id);
        });
    });

    describe('#encodeAndDecodeRole()', function() {
        // I'll be back.
        //it ('should correctly encode and decode a role', function(done) {
        //
        //    var encoded = FarmRoleController.encodeFarmRole(fakeRoleCreated);
        //    var decoded = FarmRoleController.decodeFarmRole(encoded);
        //
        //    var compareFunc = function(propertyName, role, decoded) {
        //        var actual = role.getDataValue(propertyName);
        //        return actual === decoded[propertyName];
        //    };
        //
        //    for (var key in decoded) {
        //        if (decoded.hasOwnPropety(key)) {
        //            if (!compareFunc(key, fakeRoleCreated, decoded)) {
        //                should.fail('nope');
        //            }
        //        }
        //
        //    done();
        //});

    });

    describe('#removeRole()', function(){

        it('should remove the specified role', function(){

            return FarmRoleController.removeFarmRole(fakeRoleCreated.id)
                .then(function() {
                    return FarmRoleController.getFarmRoles();
                }).then(function(roles) {
                    roles.should.not.contain.an.item.with.property('id', fakeRoleCreated.id);
                });
        });
    });
});