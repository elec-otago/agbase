/*
* FarmRole Controller
 */
var orm = agquire('ag/db/orm');
var helpers = agquire('ag/db/controllers/utils/helpers');
var booleanEncoder = agquire('ag/utils/booleanEncoder');

var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');
var defined = agquire('ag/utils/defined');

var createFarmRole = function (roleDetails){

    if (!defined(roleDetails) || roleDetails === null) {
        return helpers.rejectWithValidationError("details cannot be null");
    }

    var newRole = {};
    newRole.name = roleDetails.name;
    newRole.editFarmPermissions = roleDetails.editFarmPermissions;
    newRole.viewFarmPermissions = roleDetails.viewFarmPermissions;
    newRole.editFarmHerds = roleDetails.editFarmHerds;
    newRole.viewFarmHerds = roleDetails.viewFarmHerds;
    newRole.editFarmAnimals = roleDetails.editFarmAnimals;
    newRole.viewFarmAnimals = roleDetails.viewFarmAnimals;
    newRole.editFarmMeasurements = roleDetails.editFarmMeasurements;
    newRole.viewFarmMeasurements = roleDetails.viewFarmMeasurements;
    newRole.inviteUsers = roleDetails.inviteUsers;

    return helpers.findOrCreateEntityOnly(orm.model("FarmRole"), {
        name: roleDetails.name
    }, newRole);
};

var getPermissionNames = function(){

    var permissions = [];

    ['FarmPermissions', 'FarmHerds', 'FarmAnimals', 'FarmMeasurements'].forEach(function(name) {
        permissions.push('view' + name);
        permissions.push('edit' + name);
    });

    permissions.push('inviteUsers');

    return permissions;
};

exports.createFarmRoles = function(roles){

    if (!Array.isArray(roles)) {
        return helpers.rejectWithValidationError('no roles provided');
    }

    return Promise.promiseForArray(roles, createFarmRole);
};

exports.updateFarmRoles = function(roles) {
    var FarmRole = orm.model("FarmRole");
    var matchingNames = [];
    for (var x = 0; x < roles.length; x++) {
        matchingNames.push(roles[x].name);
    }

    var permissionNames = getPermissionNames();

    return helpers.findAll(FarmRole, {where: {name: {in: matchingNames}}})
        .then(function(roleEntities) {
            if (roleEntities.length !== roles.length) {
                return helpers.rejectWithError('Expected ' + roles.length + ' entities and only found ' + roleEntities.length);
            }

            var predicate = function(a, b) {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                } else {
                    return 0;
                }
            };

            roles.sort(predicate);
            roleEntities.sort(predicate);

            return Promise.promiseForArray(roleEntities, function(entity, index) {
                // just for sanity
                if (entity.name !== roles[index].name) {
                    return helpers.rejectWithError('updateFarmRoles logic error (1)');
                }

                for (var i = 0; i < permissionNames.length; i++) {
                    var name = permissionNames[i];
                    entity[name] = roles[index][name];
                }
                return helpers.saveEntity(entity);
            });
        });

};

exports.findFarmRole = function(roleName) {
    if (!roleName || !roleName.length) {
        return helpers.rejectWithValidationError("Empty role name");
    }

    return helpers.findOne(orm.model("FarmRole"), {where: {name: roleName}});
};

exports.getFarmRoles = function() {

    return helpers.findAll(orm.model("FarmRole"));
};

exports.getFarmRole = function(query){

    query = helpers.createParamsForIdIfRequired(query);
    return helpers.findOne(orm.model("FarmRole"), query);
};

exports.removeFarmRole = function (query, authCallback) {

    if(! query){
        return helpers.rejectWithError("No query supplied");
    }

    query = helpers.createParamsForIdIfRequired(query);
    return helpers.removeOne(orm.model("FarmRole"), query, authCallback);
};

exports.encodeFarmRole = function (role) {

    // TODO needs a refactor
    return booleanEncoder.encode(role, getPermissionNames(), ['']);
};

exports.decodeFarmRole = function(encodedRole) {
    return booleanEncoder.decode(encodedRole, getPermissionNames(), ['']);
};

exports.getPermissionNames = function(){
    return getPermissionNames();
};

