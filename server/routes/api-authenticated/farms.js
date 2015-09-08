/**
 * API for farms
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 **/
var express = require('express');
var router = express.Router();
var helpers = agquire('ag/routes/utils/helpers');
var permissions = require('../utils/permissions');
var defined = require('../../utils/defined');
var responder = agquire('ag/routes/utils/responder');
var UserManager = agquire('ag/utils/UserManager');
// TODO really need to refactor everything to use this one
var RequestValidator = agquire('ag/routes/utils/requestValidator');
var FarmController = agquire('ag/db/controllers/FarmController');
var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');
var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');

var possibleIncludes = ['herds', 'animals', 'permissions'];

var includePermissions = function(userQuery) {
    var access = {};

    access.requiredPermissions = [];

    if (userQuery.include.herds) {
        access.requiredPermissions.push(permissions.kViewFarmHerds);
    }

    if (userQuery.include.animals) {
        access.requiredPermissions.push(permissions.kViewFarmAnimals);
    }

    if (userQuery.include.permissions) {
        access.requiredPermissions.push(permissions.kViewFarmPermissions);
    }

    return access;
};

/**
 * @api {get} /farms/ List all Farms
 * @apiName GetFarms
 * @apiGroup Farms
 *
 * @apiParam {String} [name] Filter by farm name.
 * @apiParam {String} [include] list of objects to include in response (herds, animals, permissions)
 *
 * @apiSuccess {Object[]} farms Array of farms.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "farms": [
 *          {
 *          id: 1,
 *          name: "Demo Farm",
 *          animals: [],
 *          herds: [{id: 1, name: "demo herd"}],
 *          permissions:[]
 *          }
 *       ]
 *     }
 *
 * @apiError FarmNotFound No farms could be found with the specified parameters
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "FarmNotFound"
 *     }
 *
 * @apiUse AuthorisationError
 */
router.get('/',  function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        includes: possibleIncludes,
        entities: [],
        other: ['offset', 'limit', 'name']
    });

    var params = userQuery.params;

    var query = {where: {}};
    query.include = userQuery.includeList;
    helpers.setIfExists("name", query.where, userQuery);
    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    var filterName = params.name;

    var access = includePermissions(userQuery);

    if (defined(query.where.name)) {

        responder.respond(res, {
            farms: FarmController.getFarms(query).then(function(farms) {

                if(farms.length) {
                    access.farm = {id: farms[0].id};
                    req.user.requiresAccess(access);
                }

                return farms;
            })
        });

    } else {
        var farmList = null;
        if (!req.user.role.viewFarms) {
            // They can only view the farms they have permissions on
            farmList = [];
            for (var key in req.user.permissions) {
                if(req.user.permissions.hasOwnProperty(key)) {

                    var permission = req.user.permissions[key];
                    if (permission.farmId) {
                        farmList.push(permission.farmId);
                    }
                }
            }

            query.where = {id: {in: farmList}};

        } else {
            // They already have this access, so a little redundant but oh well
            access.requiredPermissions.push(permissions.kViewFarms);
        }

        // We're searching all of the user's farms, so they need permission
        access.requiredForEachFarm = true;

        responder.authAndRespond(req, res, access, function() {
            return {
                farms: FarmController.getFarms(query)
            };
        });
    }
});


/**
 * @api {post} /farms/ Create a Farm
 * @apiName CreateAFarm
 * @apiGroup Farms
 *
 * @apiParam {String} [name] Name of the new farm.
 *
 * @apiSuccess {Object[]} farm Newly created farm object.
 * @apiSuccess {String} message Result message - "Created" if a new farm was created or "Existed" if a farm existed with the same name.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "farm":
 *          {
 *          id: 1,
 *          name: "Demo Farm"
 *          },
 *       "message": "Created"
 *     }
 *
 * @apiError FarmNameMissing A valid farm name was not included in the post, check the post structure.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Un-processable Entity
 *     {
 *       "error": "FarmNameMissing"
 *     }
 */
router.post('/', function(req, res) {

    helpers.validateRequestBody(req, res, {
        name: helpers.isValidString
    }, function(params) {
        var access = {};
        //access.requiredPermissions = [permissions.kEditFarms];

        // TODO: SECURITY ISSUE! If you try and create a farm that already
        // TODO: exists then you are given manager rights to it
        // TODO: createFarm should NOT use findOrCreate
        responder.authAndRespond(req, res, access, function() {
            return {
                farm: FarmController.createFarm(params.name).then(function(farm) {
                    return FarmRoleController.findFarmRole('Manager').then(function(role){
                        return FarmPermissionController.createFarmPermission(req.user.id, farm.id, role.id);
                    }).then(function() {
                        return farm;
                    });
                })
            };
        });
    });
});

/**
 * @api {post} /farms/:farm_id/invite       Invite a user to the farm
 * @apiName InviteToFarm
 * @apiGroup Farms
 *
 * @apiParam {Number} farmRoleId                        Role to invite the user as
 * @apiParam {String} email                             Email address to invite, if no user exists then they are invited
 *                                                      to join the system.
 * @apiParam {Object} urlDescriptors                    Describe the url that is included in the email
 * @apiParam {Object} urlDescriptors.existing           Url to send for users with an existing account
 * @apiParam {String} urlDescriptors.existing.base      Base url, i.e. https://google.com
 * @apiParam {String} urlDescriptors.existing.param     GET parameter used to pass in the invite token
 * @apiParam {String} urlDescriptors.signup             Url to send for new users
 * @apiParam {String} urlDescriptors.existing.base      Base url, i.e. https://google.com
 * @apiParam {String} urlDescriptors.existing.param     GET parameter used to pass in the invite token
 */
router.post('/:farm_id/invite', function(req, res) {

    req.body.farmId = req.params.farm_id;
    RequestValidator.validate(req.body, res, {
        farmId: RequestValidator.validator.isInt,
        farmRoleId: RequestValidator.validator.isInt,
        email: RequestValidator.validator.isEmail,
        urlDescriptors: {
            existing: RequestValidator.isValidUrlDescriptor,
            signup: RequestValidator.isValidUrlDescriptor
        }
    }, function(params) {
        var access = {};
        access.farm = {id: params.farmId};
        access.requiredPermissions = [permissions.kInviteToFarm];

        responder.authAndRespond(req, res, access, function() {
            return {
                promise: UserManager.inviteToFarm({
                    invitee: {
                        email: params.email
                    },
                    farmId: params.farmId,
                    farmRoleId: params.farmRoleId,
                    urlDescriptors: params.urlDescriptors
                })
            };
        });
    });
});

/**
 * @api {post} /farms/accept       Accept an invite to a farm
 * @apiName AcceptFarmInvite
 * @apiGroup Farms
 *
 * @apiDescription Accept an invite to a farm. After accepting you should
 * replace your auth token with the one provided.
 *
 * @apiParam {String} token                             Token received via email
 *
 * @apiSuccess {String} newAuthToken            New token that should be used for future requests
 */
router.post('/accept', function(req, res) {

    req.body.farmId = req.params.farm_id;
    RequestValidator.validate(req.body, res, {
        token: RequestValidator.isValidBundle
    }, function(params) {

        responder.authAndRespond(req, res, {}, function() {
            return {
                newAuthToken: UserManager.acceptInviteToFarm({
                    bundle: params.token,
                    userId: req.user.id
                })
            };
        });
    });
});

/**
 * @api {get} /farms/:id Request Farm information
 * @apiName GetFarm
 * @apiGroup Farms
 *
 * @apiParam {Number} id The Farms unique id.
 *
 * @apiSuccess {Farm[]} farm The farm object requested.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "farm":
 *          {
 *          id: 1,
 *          name: "Demo Farm"
 *          },
 *     }
 *
 * @apiError FarmNotFound A farm could not be found with the ID provided.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "error": "FarmNotFound"
 *     }
 */
router.get('/:farm_id', function(req, res) {

    var reqFarmId = req.params.farm_id;

    var userQuery = helpers.parseQuery(req.query, {
        includes: possibleIncludes
    });

    var access = includePermissions(userQuery);
    access.farm = {id: reqFarmId};
    access.requiredPermissions = [permissions.kViewFarms];

    var query = {};
    query.include = userQuery.includeList;
    query.where = {id: reqFarmId};

    responder.authAndRespond(req, res, access, function() {
        return {
            farm: FarmController.getFarm(query)
        };
    });
});


/**
 * @api {put} /farms/:id Update a Farm Name
 * @apiName UpdateFarm
 * @apiGroup Farms
 *
 * @apiParam {Number} id The Farms unique id.
 *
 * @apiParam {String} name The new name for the farms
 *
 * @apiSuccess {Farm[]} farm The farm object that has been updated.
 * @apiSuccess {String} message Repsonse message - "Updated" for a successful update
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "farm":
 *          {
 *          id: 1,
 *          name: "Demo Farm"
 *          },
 *        "message": "Updated"
 *     }
 *
 * @apiError FarmNotFound A farm could not be found with the ID provided.
 * @apiError FarmNameNotProvided A farm could not be found in the requests
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "error": "FarmNotFound"
 *     }
 */
router.put('/:farm_id', function(req, res) {

    helpers.validateRequestBody(req, res, {
        name: helpers.isValidString
    }, function(inputs) {
        var reqFarmId = req.params.farm_id;

        var access = {};

        access.farm = {id:reqFarmId};
        access.requiredPermissions = [permissions.kEditFarms];

        responder.authAndRespond(req, res, access, function() {
            return {
                farm: FarmController.updateFarm(reqFarmId, {name: inputs.name})
            };
        });
    });
});


/**
 * @api {delete} /farms/:id Request Farm information
 * @apiName DeleteFarm
 * @apiGroup Farms
 *
 * @apiParam {Number} id The Farms unique id.
 *
 * @apiSuccess {String} message Response message - "Removed" for a success.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "message" : "Removed"
 *     }
 *
 * @apiError FarmNotFound A farm could not be found with the ID provided.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "error": "FarmNotFound"
 *     }
 */
router.delete('/:farm_id', function(req, res) {

    var reqFarmId = req.params.farm_id;

    var access = {};

    access.farm = {id:reqFarmId};
    access.requiredPermissions = [permissions.kEditFarms];

    responder.authAndRespond(req, res, access, function() {
        return {
            promise: FarmController.removeFarm(req.params.farm_id)
        };
    });
});


module.exports = router;
