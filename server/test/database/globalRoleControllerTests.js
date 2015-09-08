var GlobalRoleController = agquire('ag/db/controllers/GlobalRoleController');
var orm = agquire('ag/db/orm');

var fakeRoleCreated;
var fakeRoleDetails;

describe('GlobalRoleController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){

        fakeRoleDetails =
        {
            name   : "Test Role"
        };

        return dataSource.setup();
    });


    describe('#createGlobalRole()', function(){

        it('should create the specified role', function() {

            return GlobalRoleController.createGlobalRoles([fakeRoleDetails])
                .then(function(roles) {
                    should.exist(roles);

                    fakeRoleCreated = roles[0];

                    fakeRoleCreated.should.have.property('id');

                    fakeRoleCreated.should.have.property('name',fakeRoleDetails.name);
                });
        });


        it('should not create the specified role', function(){

            return GlobalRoleController.createGlobalRoles(null)
                .should.be.rejected;
        });


        it('should not create the specified role with no name', function(){

            return GlobalRoleController.createGlobalRoles([{test: 'test'}])
                .should.be.rejected;
        });


        it('should not create a new role with duplicate name', function(){

            return GlobalRoleController.createGlobalRoles([fakeRoleDetails])
                .then(function(roles) {
                    roles[0].id.should.equal(fakeRoleCreated.id);
                });
        });
    });


    describe('#getRole()', function(){

        it('should retrieve the role we created', function() {

            return GlobalRoleController.getGlobalRole(fakeRoleCreated.id).then(function(role) {

                fakeRoleCreated.id.should.equal(role.id);
            });
        });
    });

    describe('#getGlobalRoleByName()', function(){

        it('should retrieve the role we created', function(){

            return GlobalRoleController.getGlobalRoleByName(fakeRoleCreated.name).then(function(role) {

                fakeRoleCreated.id.should.equal(role.id);

            });
        });
    });

    describe('#encodeAndDecodeRole()', function() {
        it ('should correctly encode and decode a role', function(done) {

            fakeRoleCreated.viewFarms = true;

            var encoded = GlobalRoleController.encodeGlobalRole(fakeRoleCreated);
            var decoded = GlobalRoleController.decodeGlobalRole(encoded);

            var Role = orm.model('GlobalRole');
            var properties = Role.getPermissionNames();

            var compareFunc = function(propertyName, role, decoded) {
                var actual = role.getDataValue(propertyName);
                return actual === decoded[propertyName];
            };

            for (var i = 0; i < properties.length; i++) {
                var propertyName = properties[i];
                compareFunc('view'+propertyName, fakeRoleCreated, decoded);
                compareFunc('edit'+propertyName, fakeRoleCreated, decoded);
            }
            done();
        });

    });

    describe('#removeRole()', function(){

        it('should remove the specified role', function(){

            return GlobalRoleController.removeGlobalRole(fakeRoleCreated.id).then(function() {

                return GlobalRoleController.getGlobalRoles();
            }).then(function(roles) {

                for(var i = 0; i < roles.count; i++){

                    roles[i].should.not.have.property('id',fakeRoleCreated.id);

                }
            });
        });
    });
});