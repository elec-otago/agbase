/**
 * Created by mark on 5/09/14.
 */
var supertest = require('supertest');
var api = supertest('https://localhost:8443');
var app = require('../../app');
var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));


var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');
var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');
var FarmController = agquire('ag/db/controllers/FarmController');
var UserController = agquire('ag/db/controllers/UserController');

var token;
var testFarm;
var testFarmRole;
var testFarmRole2;
var testUser;
var testPermission;
var demoFarmId;
var viewerFarmRoleId;
var demoFarmViewerPermission;
var createdTestUserId;

describe('Farm Permission Rest API', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function () {

        return login.loginAsync(api).then(function () {
            return dataSource.setup().then(function() {
                return FarmPermissionController
                    .createFarmPermission(dataSource.demoUser.id, dataSource.farm1.id, dataSource.viewerFarmRole.id);
            });
        });
    });

    describe('#get farm permissions', function(){

        it('should get all farm permissions', function(){

            return login.getAsync(api, '/api/farm-permissions')
                .then(function(res) {
                    res.statusCode.should.equal(200);
                    should.exist(res.body);
                    res.body.permissions.should.not.be.empty;
                });
        });
    });

    describe('#post farm permissions', function(){

        it('should create farm permission', function() {

            return login.postAsync(api, '/api/farm-permissions', {
                farmId: dataSource.farm2.id,
                userId: dataSource.demoUser.id,
                farmRoleId: dataSource.viewerFarmRole.id
            }).then(function (res) {
                res.statusCode.should.equal(200);
                should.exist(res.body.permission);

                res.body.permission.should.have.property('userId', dataSource.demoUser.id);
                res.body.permission.should.have.property('farmId', dataSource.farm2.id);
                res.body.permission.should.have.property('farmRoleId', dataSource.viewerFarmRole.id);

                testPermission = res.body.permission;
            });
        });
    });

    describe('#put farm permissions', function(){

        it('should update farm permission', function(){

            return login.putAsync(api, '/api/farm-permissions/'+ testPermission.id, {
                farmRoleId: dataSource.managerFarmRole.id
            }).then(function(res) {
                res.statusCode.should.equal(200);
                should.exist(res.body.permission);

                res.body.permission.should.have.property('userId', dataSource.demoUser.id);
                res.body.permission.should.have.property('farmId', dataSource.farm2.id);
                res.body.permission.should.have.property('farmRoleId', dataSource.managerFarmRole.id);

                testPermission = res.body.permission;
            });
        });
    });

    describe('#delete farm permissions', function(){

        it('should update farm permission', function(){

            return login.deleteAsync(api, '/api/farm-permissions/' + testPermission.id)
                .then(function(res) {

                    res.statusCode.should.equal(200);

                    return FarmPermissionController.getFarmPermission(testPermission.id);
                }).should.be.rejectedWith(errors.NoResultError);
        });
    });

    // TODO reimplement
    //describe('#add demo farm permissions', function() {
    //
    //    it('should give permission on demo farm', function(done) {
    //
    //        should.exist(demoFarmId);
    //        should.exist(viewerFarmRoleId);
    //
    //        var userDetails = {firstName : "demoTestUser", lastName: "test", password:"testing", email:"test@test.test"};
    //
    //        UserController.createSingleUser(userDetails, function(err, user) {
    //            //should.not.exist(err);
    //            should.exist(user);
    //
    //            createdTestUserId = user.id;
    //
    //            var checkPermissions = function(permissionId, userToken, next) {
    //                // check permissions with new user
    //                api
    //                    .get('/api/farm-permissions?userId=' + createdTestUserId)
    //                    .set('Authorization', 'Bearer '+ userToken)
    //                   // .send({user:createdTestUserId})
    //                    .end(function(err, res) {
    //                        should.not.exist(err);
    //                        res.statusCode.should.equal(200);
    //                        should.exist(res.body);
    //
    //                        if (permissionId) {
    //                            res.body.permissions[0].id.should.equal(permissionId);
    //                        } else {
    //                            res.body.permissions.length.should.equal(0);
    //                        }
    //
    //                        next();
    //                    });
    //            };
    //
    //            api
    //                .post('/api/auth')
    //                .set('Accept', 'application/json')
    //                .send({
    //                    email: userDetails.email,
    //                    password: userDetails.password
    //                })
    //                .end(function(err, res){
    //
    //                    var testUserToken = res.body.token;
    //
    //                    console.log("got token for test user " + testUserToken);
    //
    //                    // should initially have no permissions
    //                    checkPermissions(null, testUserToken, function() {
    //                        // add permissions using unittest user
    //                        api
    //                            .post('/api/farm-permissions')
    //                            .set('Authorization', 'Bearer '+ token)
    //                            .send({userId: createdTestUserId, farmId: demoFarmId, farmRoleId: viewerFarmRoleId})
    //                            .end(function(err, res){
    //
    //                                should.not.exist(err);
    //                                res.statusCode.should.equal(200);
    //                                should.exist(res.body);
    //
    //                                demoFarmViewerPermission = res.body.permission;
    //
    //                                // should now have permission
    //                                checkPermissions(demoFarmViewerPermission.id, testUserToken, done);
    //                        });
    //                    });
    //
    //            });
    //        });
    //    });
    //});

});