var UserController = agquire('ag/db/controllers/UserController');
var GlobalRoleController = agquire('ag/db/controllers/GlobalRoleController');
var FarmController = agquire('ag/db/controllers/FarmController');

var fakeUsersCreated;
var multipleUserDetails;

describe('UserController', function(){

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');
    before(function(){

        multipleUserDetails = [
            {
                firstName   : 'Benjamin',
                lastName    : 'Franklin',
                email       : 'test1@example.com',
                password    : 'somepassword'
                //globalRoleName: 'user'
            },
            {
                firstName   : 'Albert',
                lastName    : 'Einstein',
                email       : 'test2@example.com',
                password    : 'someotherpassword'
                //this user is testing default role assignment
            }
        ];

        return dataSource.setup().then(function() {
            testCategory = dataSource.measurementCategory1;
            otherCategory = dataSource.measurementCategory2;
            extraAlgorithm = dataSource.measurementCategory1.algorithm1;
        });

    });

    describe('#createUsers()', function(){
        it('should create the specified users', function(){

            return UserController.createUsers(multipleUserDetails)
                .then(function(usersCreated) {

                    should.exist(usersCreated);
                    usersCreated.should.have.property('length', multipleUserDetails.length);

                    fakeUsersCreated = usersCreated;

                    //These seem to switch depending on which database query returns first
                    //fakeUsersCreated[0].should.have.property('email', multipleUserDetails[0].email);
                    //fakeUsersCreated[1].should.have.property('email', multipleUserDetails[1].email);
                    fakeUsersCreated[0].should.have.property('id');

                    fakeUsersCreated[0].dataValues.should.not.have.property('hash');
                });
        });

        it('should not create a duplicate user', function() {

            return UserController.createSingleUser(multipleUserDetails[0])
                .then(function(user) {

                    should.exist(user);

                    var fakeUser;

                    for(var i = 0; i < fakeUsersCreated.length; ++i){

                        if(fakeUsersCreated[i].email == multipleUserDetails[0].email){
                            fakeUser = fakeUsersCreated[i];
                            break;
                        }
                    }

                    // Should use the same user with no details changed
                    user.id.should.equal(fakeUser.id);
                    user.firstName.should.equal(fakeUser.firstName);
                    user.lastName.should.equal(fakeUser.lastName);
                    user.email.should.equal(fakeUser.email);
                });
        });


        it('should not create a duplicate user when upper case used', function(){

            multipleUserDetails[0].email  = 'TEST1@example.com';

            return UserController.createSingleUser(multipleUserDetails[0]).then(function(user) {

                //returns the user that already existed
                var fakeUser;

                for(var i = 0; i < fakeUsersCreated.length; ++i){

                    if(fakeUsersCreated[i].email == user.email){
                        fakeUser = fakeUsersCreated[i];
                        break;
                    }
                }

                user.id.should.equal(fakeUser.id);
            });
        });

        it('should reject bad emails (1)', function(){
            var badEmail = {email:"hello", firstName:"ok", lastName:"ok", password:")*(@"};
            return UserController.createSingleUser(badEmail).should.be.rejected;
        });

        it('should reject bad emails (2)', function(){
            var badEmail = {email:"hello@hello", firstName:"ok", lastName:"ok", password:")*(@"};
            return UserController.createSingleUser(badEmail).should.be.rejected;
        });

        it('should reject bad emails (3)', function(){
            var badEmail = {email:".hello", firstName:"ok", lastName:"ok", password:")*(@"};
            return UserController.createSingleUser(badEmail).should.be.rejected;
        });

        it('should accept email aliases', function(){
            var goodEmail = {email:"hello+me@myemail.com", firstName:"ok", lastName:"ok", password:")*(@"};
            return UserController.createSingleUser(goodEmail);
        });

        //it('should have roles', function(){
        //
        //    GlobalRoleController.getGlobalRoles(fakeUsersCreated[0].id,function(err, roles){
        //
        //        should.not.exist(err);
        //
        //        var userRole = roles[0];
        //
        //        should.exist(userRole);
        //
        //        done();
        //    });
        //});
    });


    describe('#authUser()', function(){

        it('should successfully change the password', function(){

            var userToChange = fakeUsersCreated[0];
            var oldPassword = userToChange.firstName === multipleUserDetails[0].firstName ? multipleUserDetails[0].password : multipleUserDetails[1].password;

            return UserController.updateUser(userToChange.id, {password:'newpassword'})
                .then(function(user) {
                    // should only change password
                    userToChange.firstName.should.equal(user.firstName);
                    userToChange.lastName.should.equal(user.lastName);
                    userToChange.email.should.equal(user.email);

                    return UserController.authUser(user.email, 'newpassword');
                })
                .then(function(user) {
                    // should be the correct user
                    userToChange.email.should.equal(user.email);

                    return UserController.authUser(user.email, oldPassword)
                        .then(function() {
                            // shouldn't have let me auth
                            should.fail("shouldn't have let me auth");
                        })
                        .error(function() {
                            // Good, keep going
                            return Promise.resolve();
                        });
                })
                .then(function() {
                    // change it back
                    return UserController.updateUser(userToChange.id, {password: oldPassword});
                });
        });

        it('should authenticate both users', function(){

            return UserController.authUser(multipleUserDetails[0].email, multipleUserDetails[0].password)
                .then(function() {
                   return UserController.authUser(multipleUserDetails[1].email, multipleUserDetails[1].password);
                });
        });


        it('should authenticate the user when email case is different', function(){

            var upperCaseEmail = multipleUserDetails[0].email.toUpperCase();
            var pwd =  multipleUserDetails[0].password; //passwords for test users are both the same

            return UserController.authUser(upperCaseEmail, pwd);
        });


        it('should fail to authenticate the password has wrong case', function(){

            var email = multipleUserDetails[0].email;
            var pwd =  multipleUserDetails[0].password.toUpperCase();

            return UserController.authUser(email, pwd)
                .should.be.rejected;
        });
    });


    describe('#removeUsers()', function(){

        it('should remove the specified users', function(){

            return UserController.removeUsers(fakeUsersCreated)
                .then(function() {
                    return UserController.getUsers();
                })
                .then(function(users) {

                    users.length.should.be.at.least(1);
                    var testID = fakeUsersCreated[0].id;

                    for(var i = 0; i < users.length; i++){

                        users[i].should.not.have.property('id',testID);

                    }
                });
        });
    });


    describe('#TestRelationshipWithGlobalRole', function() {

        var testRole;
        var testUser;
        var testUserDetails = {
            firstName: 'Dave',
            lastName: 'Davidson',
            email: 'testUserRelationship@example.com',
            password: 'somepassword'
        };


        beforeEach(function (done) {

            // promise can fail but we don't care
            GlobalRoleController.createGlobalRoles([{name: "UserTestRole"}])
                .then(function (roles) {

                    testRole = roles[0];

                    testUserDetails.globalRoleName = testRole.name;

                    return UserController.createUsers([testUserDetails]);
                }).then(function (usersCreated) {

                    testUser = usersCreated[0];
                }).finally(done);
        });


        //again, can fail but we don't care
        afterEach(function (done) {

            UserController.removeSingleUser(testUser.id)
                .then(function () {
                    return GlobalRoleController.removeGlobalRole(testRole.id);
                })
                .finally(done);
        });


        it('should remove the specified users when role is removed', function () {

            return GlobalRoleController.removeGlobalRole(testRole.id)
                .then(function () {
                    return UserController.getUsers();
                })
                .then(function (users) {
                    var testID = testUser.id;
                    for (var i = 0; i < users.length; i++) {
                        users[i].should.not.have.property('id', testID);
                    }
                });
        });


        it('should not remove the role when user is removed', function () {

            return UserController.removeSingleUser(testUser.id)
                .then(function () {
                    return GlobalRoleController.getGlobalRoles(null);
                })
                .then(function (roles) {

                    for (var i = 0; i < roles.length; i++) {

                        if (roles[i].id === testRole.id) {
                            return;
                        }
                    }

                    should.fail('The role has been removed');
                });
        });

        after(function (done) {

            UserController.removeUsers(fakeUsersCreated)
                .finally(function() {
                    done();
                });
        });
    });
});