/**
 * Created by mark on 12/09/14.
 */

/*
 * FarmRole Controller
 */
var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');

var UserController = require('./UserController');
var FarmController = require('./FarmController');
var FarmRoleController = require('./FarmRoleController');
var challenge = agquire('ag/utils/challenge');
var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');


exports.createFarmPermission = function (userId, farmId, farmRoleId){

    if(! userId || ! farmId || ! farmRoleId){
        return helpers.rejectWithValidationError('Missing required parameters');
    }

    return helpers.findOrCreateEntityOnly(orm.model("FarmPermission"), {
        userId: userId,
        farmId: farmId,
        farmRoleId: farmRoleId
    });
};


exports.getFarmPermissions = function(params){

    return helpers.findAll(orm.model("FarmPermission"), params);
};


/**
 * Get single permission
 * @param params either a typical query or an integer containing the permission id
 * @param callback
 */
exports.getFarmPermission = function(params){

    params = helpers.createParamsForIdIfRequired(params);
    return helpers.findOne(orm.model("FarmPermission"), params);
};


exports.updateFarmPermission = function (params, permissionDetails, authCallback) {

    if(!params){
        return helpers.rejectWithValidationError('permissionId required');
    }

    if(! permissionDetails.farmRoleId){
        return helpers.rejectWithValidationError('farmRoleId required');
    }

    params = helpers.createParamsForIdIfRequired(params);
    return helpers.updateOne(orm.model("FarmPermission"), params, authCallback, function(permission) {
       permission.farmRoleId = permissionDetails.farmRoleId;
    });
};


/*
 * callback(err)
 */
exports.removeFarmPermission = function (params, authCallback){

    params = helpers.createParamsForIdIfRequired(params);
    return helpers.removeOne(orm.model("FarmPermission"), params, authCallback);
};


exports.createMultipleFarmPermissions = function (permissions){

    return Promise.promiseForArray(permissions, function(permissionDetails) {
        return exports.createFarmPermission(permissionDetails.userId, permissionDetails.farmId, permissionDetails.farmRoleId);
    });

};


exports.inviteUserToFarm = function(details) {
    var email = details.email,
        farmId = details.farmId,
        farmRoleId = details.farmRoleId;

    return helpers.createOne(orm.model('FarmInvitation'), {
        token: challenge.create(),
        farmId: farmId,
        email: email,
        farmRoleId: farmRoleId
    });
};

exports.acceptInviteToFarm = function(details) {
    var token = details.token,
        email = details.email,
        userId = details.userId,
        farmId = details.farmId;

    return helpers.removeOne(orm.model('FarmInvitation'), {where: {
        token: token,
        email: email,
        farmId: farmId
    }}).then(function(invite) {
        return exports.createFarmPermission(userId, farmId, invite.farmRoleId);
    });
};


exports.encodeFarmPermissions = function(permissions) {
    var FarmRoleController = require("./FarmRoleController");

    var encoded = [];

    for (var x = 0; x < permissions.length; x++) {
        var permission = permissions[x];

        var encodedRole = FarmRoleController.encodeFarmRole(permission.farmRole);
        encoded.push({farmId: permission.farmId, farmRole: encodedRole});
    }

    return encoded;
};

exports.decodeFarmPermissions = function(encoded) {
    var FarmRoleController = require("./FarmRoleController");

    var decoded = [];

    for (var x = 0; x < encoded.length; x++) {
        var encodedPermission = encoded[x];
        var decodedRole = FarmRoleController.decodeFarmRole(encodedPermission.farmRole);
        decoded.push({farmId: encodedPermission.farmId, farmRole: decodedRole});
    }
    return decoded;
};