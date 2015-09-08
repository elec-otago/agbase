var orm = require('../orm');
var Promise = require('../../wowPromise');
var passwordUtils = require('../../utils/password');
var validator = require('validator');
var GlobalRoleController = require('./GlobalRoleController');
var FarmController = require('./FarmController');
var FarmRoleController = require('./FarmRoleController');
var UsageTierController = require('./UsageTierController');
var defined = agquire('ag/utils/defined');
var helpers = require('./utils/helpers');
var forEach = agquire('ag/utils/forEachIn');
var dbDefaults = agquire('ag/db/dbDefaults');
var challenge = agquire('ag/utils/challenge');

var prepareQuery = function(query, callback, includeHash) {
    var User = orm.model("User");
    query = helpers.parseQueryParams(query, User);

    if (arguments.length === 2 || !includeHash) {
        // Select all fields apart from hash (which is the password)
        query.dbQuery.attributes = User.attributesExcluding('hash');
    }

    return callback(User, query);
};

//callback (err, users)
exports.getUsers = function(query) {

    return prepareQuery(query, function(User, query) {
        return helpers.findAll(User, query);
    });
};


/*
 * create users for the system. should require superuser privileges
 *
 * { users : [
 *           {
 *           email:
 *           firstName:
 *           lastName:
 *           password:
 *           role: <roleID>
 *           farms: [<farmIDs>]
 *           }
 *           ]
 * }
 *
 * callback (err, users)
 *
 */
var createUsers = function(users) {

    return Promise.promiseForArray(users, function(user) {
        return createSingleUser(user);
    });
};


var removeUsers = function(users, authCallback) {

    return Promise.promiseForArray(users, function(user) {
       return removeSingleUser(user.id, authCallback);
    });
};

/*
 * callback(err)
 */
function removeSingleUser(query, authCallback) {

    query = helpers.createParamsForIdIfRequired(query);

    return prepareQuery(query, function(User, query) {
        return helpers.removeOne(User, query, authCallback);
    });
}


/*
* callback(err, user)
 */

exports.getUser = function(query) {

    query = helpers.createParamsForIdIfRequired(query);
    return prepareQuery(query, function(User, query) {
        return helpers.findOne(User, query);
    });
};

exports.getUserByEmail = function(email) {
    return exports.getUser({where: {email: email.toLowerCase()}});
};

/*
 * Authenticate a user - check email and password exists
 * callback provides user
 */
exports.authUser = function(email, password) {
    if(! validator.isEmail(email)) {
        return Promise.reject(new Error('Not a valid email address'));
    }

    email = email.toLowerCase();

    var query = {};
    query.where = {email: email};
    query.include = ['globalRole', 'permissions', 'permissions.farmRole'];

    var User = orm.model("User");
    return helpers.findOne(User, query)
        .bind({}) // important (use bind user onto it)
        .then(function(user) {
            console.log('Located user ' + user.email);

            this.user = user;
            return passwordUtils.compare(password, user.hash);
        })
        .then(function(isMatch){

            if (!isMatch) {
                return Promise.reject(new Error('Password incorrect'));
            }

            var user = this.user;
            //MDB: token must be built on JSON object
            var userJSON = {id: user.id, email: user.email,  firstName: user.firstName, lastName: user.lastName,
                role: user.globalRole, permissions: user.permissions}; //i.e no password

            return userJSON;
        });
};


exports.authUserWithoutPassword = function(user) {
    var query = {};
    query.where = {id: user.id};
    query.include = ['globalRole', 'permissions', 'permissions.farmRole'];

    var User = orm.model("User");
    return helpers.findOne(User, query).then(function(user) {
        var userJSON = {id: user.id, email: user.email,  firstName: user.firstName, lastName: user.lastName,
            role: user.globalRole, permissions: user.permissions}; //i.e no password

        return userJSON;
    });
};

//create a user with no relationships, userdetails must be already validated
// callback function(err,user)
function createRawUser(userDetails) {

    var User = orm.model('User');

    return passwordUtils.hash(userDetails.password)
        .then(function(hash) {

            userDetails.email = userDetails.email.toLowerCase();

            return helpers.findOrCreate(User, {email: userDetails.email}, {
                    email: userDetails.email,
                    firstName: userDetails.firstName,
                    lastName: userDetails.lastName,
                    hash: hash
                }).spread(function(user, created) {
                    // TODO change away from findOrCreate and just create?
                    // TODO or maybe error? this doesn't seem good anyway..
                    return user;
                });
        });
}


function createUserWithRole(role, userDetails){

    return createRawUser(userDetails)
        .bind({})
        .then(function(user) {
            console.log("Created new user: " + user.email);
            delete user.dataValues.hash;
            this.user = user;
            return role.addUser(user);
        })
        .then(function() {
            console.log("Assigned new user " + this.user.email + " to role: " + role.name);

            // TODO use farm controller when updated
            if(userDetails.farmId) {
                var Farm = orm.model('Farm');
                return helpers.findOne(Farm, {where: {id: userDetails.farmId}})
                    .then(function(farm) {
                        console.log("Adding user to farm: " + farm.name);
                        return farm.addUser(this.user);
                    });
            }
        })
        .then(function() {
            this.user.globalRoleId = role.id;
            return this.user;
        });
}


/*
 * Requires password to be hashes already
 * callback function(err,user)
 */
function createSingleUser(details) {

    var userDetails = JSON.parse(JSON.stringify(details));

    function getTier(){

        if(userDetails.usageTierId) {
            return Promise.resolve({id:userDetails.usageTierId});
        }else if(userDetails.usageTierName){
            return UsageTierController.getUsageTierByName(userDetails.usageTierName);
        }else {
            return UsageTierController.getUsageTierByName(dbDefaults.usageTier1.name);
        }
    }

    // TODO user GlobalRoleController when updated
    var GlobalRole = orm.model('GlobalRole');
    var roleQuery = {};
    if (!userDetails.globalRoleId) {
        var roleName = userDetails.globalRoleName ? userDetails.globalRoleName : "user"; //default role
        roleQuery = {where: {name: roleName}};
    } else {
        roleQuery = {where: {id: userDetails.globalRoleId}};
    }

    return getTier().then(function(tier){

        userDetails.usageTierId = tier.id;

        return helpers.findOne(GlobalRole, roleQuery).then(function(role){
            return createUserWithRole(role, userDetails);
        });
    });
}


/**
 * Update a user
 * @param params either a typical query or an integer containing the user id
 * @param userDetails new details
 * @param callback callback
 * @param authCallback authCallback
 */
exports.updateUser = function(query, userDetails, authCallback){

    query = helpers.createParamsForIdIfRequired(query);

    return prepareQuery(query, function(User, query) {
        return helpers.updateOne(User, query, authCallback, function(user) {
            if (userDetails.email) {
                user.email = userDetails.email;
            }

            if (userDetails.firstName) {
                user.firstName = userDetails.firstName;
            }

            if (userDetails.lastName) {
                user.lastName = userDetails.lastName;
            }

            if (userDetails.password) {
                return passwordUtils.hash(userDetails.password)
                    .then(function(hash) {
                        user.hash = hash;
                    });
            }
        });
    });
};

exports.createChallenge = function(details) {
    var userId = details.userId,
        type = details.type;

    return helpers.createOne(orm.model('UserChallenge'), {
        token: challenge.create(),
        type: type,
        userId: userId
    });
};

exports.verifyChallenge = function(details) {
    var userId = details.userId,
        type = details.type,
        token = details.token;

    return helpers.removeOne(orm.model('UserChallenge'), { where: {
        token: token,
        type: type,
        userId: userId
    }});
};

exports.createUsers = createUsers;
exports.removeUsers = removeUsers;

exports.removeSingleUser  = removeSingleUser;
exports.createSingleUser = createSingleUser;