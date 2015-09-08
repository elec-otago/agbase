var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');
var FarmController = agquire('ag/db/controllers/FarmController');
var UserController = agquire('ag/db/controllers/UserController');
var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');

var testFarm;
var otherFarm;
var testUser;
var viewerFarmRole;
var testFarmPermission;

describe('FarmPermissionController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');

    before(function(){
        return dataSource.setup().then(function() {
            testFarm = dataSource.farm1;
            otherFarm = dataSource.farm2;
            testUser = dataSource.demoUser;
            viewerFarmRole = dataSource.viewerFarmRole;

            should.exist(testFarm);
            should.exist(testUser);
            should.exist(viewerFarmRole);
        });
    });

    describe('#createFarmPermission()', function(){

        it('should create the specified permission', function(){

            return FarmPermissionController.createFarmPermission(testUser.id,testFarm.id, viewerFarmRole.id).then(function(permission) {

                should.exist(permission);

                testFarmPermission = permission;
                testFarmPermission.should.have.property('id');
                testFarmPermission.should.have.property('userId', testUser.id);
                testFarmPermission.should.have.property('farmId', testFarm.id);
                testFarmPermission.should.have.property('farmRoleId', viewerFarmRole.id);
            });
        });

        it('should not create a duplicate permission with matching userID and farmID and roleID', function(){

            return FarmPermissionController.createFarmPermission(testUser.id,testFarm.id, viewerFarmRole.id)
                .should.eventually.have.property('id', testFarmPermission.id);
        });

        it('should not create the specified permission', function(){

            return FarmPermissionController.createFarmPermission(null, null, null)
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create a new permission with matching userID and farmID but different roleID', function(){

            return FarmPermissionController.createFarmPermission(testUser.id,testFarm.id, dataSource.managerFarmRole.id)
                .should.be.rejectedWith(errors.UniqueConstraintError);

        });

        it('should create a new permission with matching userID and roleID but different farm', function(){

            return FarmPermissionController.createFarmPermission(testUser.id, otherFarm.id, dataSource.managerFarmRole.id)
                .then(function(permission) {
                    should.exist(permission);
                    permission.farmRoleId.should.equal(dataSource.managerFarmRole.id);
                    permission.farmId.should.equal(otherFarm.id);
                    permission.userId.should.equal(testUser.id);
                });
        });
    });


    describe('#getFarmPermission()', function(){

        it('should retrieve the permission we created', function(){

            return FarmPermissionController.getFarmPermission(testFarmPermission.id)
                .should.eventually.have.property('id', testFarmPermission.id);
        });
    });

    describe('#updateFarmPermission()', function() {
        it('should not update will null attributes (1)', function(){

            return FarmPermissionController.updateFarmPermission(testFarmPermission.id, {userId: null})
                .should.be.rejectedWith(errors.ValidationError);

        });

        it('should not update will null attributes (2)', function(){

            return FarmPermissionController.updateFarmPermission(testFarmPermission.id, {farmRoleId: null})
                .should.be.rejectedWith(errors.ValidationError);

        });

        it('should not update will null attributes (3)', function(){

            return FarmPermissionController.updateFarmPermission(testFarmPermission.id, {farmId: null})
                .should.be.rejectedWith(errors.ValidationError);

        });
    });

    describe('#removeFarmPermission()', function(){

        it('should remove the specified Permission', function(){

            return FarmPermissionController.removeFarmPermission(testFarmPermission.id).then(function() {

                return FarmPermissionController.getFarmPermissions();

            }).then(function(permissions) {
                permissions.should.not.be.empty;
                permissions.should.not.contain.an.item.with.property('id', testFarmPermission.id);
            });
        });
    });

    //TODO: test relationship with user and farm and farmrole to ensure referential integrity



});