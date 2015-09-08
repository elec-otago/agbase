var orm = require('../orm');
var helpers = require('./utils/helpers');
var booleanEncoder = require('../../utils/booleanEncoder');

var Promise = require('../../wowPromise');
var forEach = require('../../utils/forEachIn');

var getUserGlobalRole = function(userId){

    var GlobalRole = orm.model("GlobalRole");
    return helpers.findOne(GlobalRole, {where: {'users.id': userId}});
};

var createGlobalRole = function(roleDetails) {

    if(! roleDetails.name){
        return Promise.reject(new Error("No name provided for role"));
    }

    var newRole = {};
    newRole.name = roleDetails.name;

    newRole.editAlgorithms = roleDetails.editAlgorithms;
    newRole.viewAlgorithms = roleDetails.viewAlgorithms;
    newRole.editAnimals = roleDetails.editAnimals;
    newRole.viewAnimals = roleDetails.viewAnimals;
    newRole.editFarms = roleDetails.editFarms;
    newRole.viewFarms = roleDetails.viewFarms;
    newRole.editFarmRoles = roleDetails.editFarmRoles;
    newRole.viewFarmRoles = roleDetails.viewFarmRoles;
    newRole.editGlobalRoles = roleDetails.editGlobalRoles;
    newRole.viewGlobalRoles = roleDetails.viewGlobalRoles;
    newRole.editHerds = roleDetails.editHerds;
    newRole.viewHerds = roleDetails.viewHerds;
    newRole.editMeasurements = roleDetails.editMeasurements;
    newRole.viewMeasurements = roleDetails.viewMeasurements;
    newRole.editCategories = roleDetails.editCategories;
    newRole.viewCategories = roleDetails.viewCategories;
    newRole.editFarmPermissions = roleDetails.editFarmPermissions;
    newRole.viewFarmPermissions = roleDetails.viewFarmPermissions;
    newRole.editUsers = roleDetails.editUsers;
    newRole.viewUsers = roleDetails.viewUsers;

    var GlobalRole = orm.model("GlobalRole");
    return helpers.findOrCreateEntityOnly(GlobalRole, {name: roleDetails.name}, newRole);
};


//callback(err, roles)
exports.createGlobalRoles = function(roles) {

    if(! roles || ! roles.length) {
        return Promise.reject(new Error("No roles provided"));
    }

    return Promise.promiseForArray(roles, function(role) {
        return createGlobalRole(role);
    });
};

// no auth callback because this shouldn't really be used.
exports.updateGlobalRoles = function(roles) {

    var matchingNames = [];
    for (var x = 0; x < roles.length; x++) {
        matchingNames.push(roles[x].name);
    }

    var GlobalRole = orm.model("GlobalRole");
    var properties = GlobalRole.getPermissionNames();

    return helpers.findAll(GlobalRole, {where: {name: {in: matchingNames}}})
        .then(function(roleEntities) {
            if (roleEntities.length !== roles.length) {
                return Promise.reject(new Error('Expected ' + roles.length + ' entities and only found ' + roleEntities.length));
            }

            return Promise.promiseForArray(roleEntities, function(role) {

                var roleDetails = null;

                // TODO could probably ensure both arrays have same order, but
                // TODO i'm just hacking this together for now
                for (var x = 0; x < roles.length; x++) {
                    if (roles[x].name === role.name) {
                        roleDetails = roles[x];
                        break;
                    }
                }

                if (role !== null) {
                    for (var i = 0; i < properties.length; i++) {
                        var name = properties[i];
                        var view = 'view' + name;
                        var edit = 'edit' + name;

                        role[view] = role[view];
                        role[edit] = role[edit];
                    }
                }

                return helpers.saveEntity(role);
            });
        });
};

/*
* callback(err, roles)
 */
exports.getGlobalRoles = function(userId){

    if(userId) {
        return getUserGlobalRole(userId);
    } else {
        var GlobalRole = orm.model("GlobalRole");
        return helpers.findAll(GlobalRole, {});
    }
};


/*
 callback (err,role)
 */
exports.getGlobalRole = function(query) {

    var GlobalRole = orm.model("GlobalRole");
    return helpers.findOne(GlobalRole, helpers.createParamsForIdIfRequired(query));
};

exports.getGlobalRoleByName = function(name){

    return exports.getGlobalRole({where: {name: name}});
};


/*
 * callback(err)
 */
exports.removeGlobalRole = function (query, authCallback){

    if(!query) {
        return Promise.reject(new Error("No query / role id supplied"));
    }

    var GlobalRole = orm.model("GlobalRole");
    return helpers.removeOne(GlobalRole, helpers.createParamsForIdIfRequired(query), authCallback);
};

exports.encodeGlobalRole = function (role) {
    var Role = orm.model("GlobalRole");
    var properties = Role.getPermissionNames();

    return booleanEncoder.encode(role, properties, ['view', 'edit']);
};

exports.decodeGlobalRole = function(encodedRole) {
    var Role = orm.model("GlobalRole");
    var properties = Role.getPermissionNames();

    return booleanEncoder.decode(encodedRole, properties, ['view', 'edit']);
};
