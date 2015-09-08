/**
 * API for farm-permissions
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
var forEach = require('../../utils/forEachIn');
var responder = agquire('ag/routes/utils/responder');

var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');

var possibleIncludes = ['user', 'farm', {farmRole: ['role']}];

var getPermissions = function(userQuery, farmId, userId) {
    var access = {};
    access.farm = {id: farmId};
    access.user = {id: userId, requiredPermissions: []};

    access.requiredPermissions = [];

    // We use user permissions because we want them to be able
    // to access their own data. They only require an explicit permission
    // if they want somebody else's.

    // They require specific access unless checking their own permissions
    access.user.requiredPermissions.push(permissions.kViewFarmPermissions);

    if (userQuery.include.user) {
        access.user.requiredPermissions.push(permissions.kViewGlobalUsers);
    }

    if (userQuery.include.farmRole) {
        // This isn't user specific
        access.requiredPermissions.push(permissions.kViewGlobalFarmRoles);
    }

    if (userQuery.include.farm) {
        /*jshint -W035 */
        // no-op, you need farm permissions for this anyway
    }

    return access;
};

var mapRoleInclude = function(permissions, userQuery) {

    if (userQuery.include.farmRole) {

        var mapper = function(permission) {
            if (defined(permission.farmRole)) {
                // TODO probably a better way to do this
                permission.dataValues.role = permission.farmRole;
                delete permission.dataValues.farmRole;
            }
        };

        if (Array.isArray(permissions)) {
            forEach(permissions, mapper);
        } else {
            mapper(permissions);
        }
    }
};

/* GET permissions listing. */

/**
 * @api {get} /farm-permissions/ Get all Farm Permissions
 * @apiName GetFarmPermissions
 * @apiGroup Farm-Permissions
 *
 * @apiParam {Number} farmId The id of the farm to retrieve permissions for.
 * @apiParam {String} include Defines extra data to include in the response:
 * <br>farm - The farm that the returned permission is for.
 * <br>user - The user that the returned permission is for.
 * <br>farmRole - the farm role that the returned permission is for.
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "permissions":[
 *          {
 *              "id": 1,
 *              "UserId": 1,
 *              "FarmId": 1,
 *              "FarmRoleId": 1,
 *              "user":
 *              {
 *                  "id":1,
 *                  "email": "demouesr@agbase.elec.ac.nz",
 *                  "firstName":"Demo",
 *                  "lastName":"User",
 *                  "GlobalRoleId":1
 *              },
 *              "farm":
 *              {
 *                  "id":1,
 *                  "name":"Demo Farm"
 *              },
 *              "role":
 *              {
 *                  "id":2,
 *                  "name":"Manager",
 *                  "editFarmPermissions":true,
 *                  "viewFarmPermissions":true,
 *                  "editFarmHerds":true,
 *                  "viewFarmHerds":true,
 *                  "editFarmAnimals":true,
 *                  "viewFarmAnimals":true,
 *                  "editFarmMeasurements":true,
 *                  "viewFarmMeasurements":true
 *              }
 *          }]
 *      }
 */
router.get('/', function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        includes: possibleIncludes,
        entities: ['farm', 'user', 'farmRole'],
        values: ['offset', 'limit']
    });

    var params = userQuery.params;

    var query = {};
    query.include = userQuery.includeList;

    query.where = {};
    helpers.setIfExists("farmId", query.where, userQuery);
    helpers.setIfExists("userId", query.where, userQuery);
    helpers.setIfExists("farmRoleId", query.where, userQuery);

    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    var access = getPermissions(userQuery, params.farmId, params.userId);

    responder.authAndRespond(req, res, access, function() {
        return {
            permissions: FarmPermissionController.getFarmPermissions(query)
                .then(function(permissions) {
                    mapRoleInclude(permissions, userQuery);
                    return permissions;
                })
        };
    });
});


/* POST create a farm permission */

/**
 * @api {post} /farm-permissions/ Create Farm Permission
 * @apiName PostFarmPermission
 * @apiGroup Farm-Permissions
 *
 * @apiParam {Number} farmId Id of farm to create permission for.
 * @apiParam {Number} userId Id of user to create permission for.
 * @apiParam {Number} farmRoleId Role id of permission:
 * <br>1 - Viewer
 * <br>2 - Manager
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Created Farm Permission!"
 *          "permission":
 *          {
 *              "id": 1,
 *              "UserId": 1,
 *              "FarmId": 1,
 *              "FarmRoleId": 1
 *          }
 *      }
 *
 * @apiError EmptyRequestBody No data included in request body.
 * @apiErrorExample EmptyRequestBody
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "EmptyRequestBody"
 *      }
 *
 * @apiError MissingFarmId Farm id not included as part of the request.
 * @apiErrorExample MissingFarmId
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "message": "Must specify farmId"
 *      }
 *
 * @apiError MissingUserId User id not included as part of the request.
 * @apiErrorExample MissingUserId
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "message": "Must specify userId"
 *      }
 *
 * @apiError MissingFarmRoleId Farm role id not included as part of the request.
 * @apiErrorExample MissingFarmRoleId
 *      HTTP/1.1 MissingFarmRoleId
 *      {
 *          "message": "Must specify farmRoleId"
 *      }
 */
router.post('/',  function(req, res) {

    helpers.validateRequestBody(req, res, {
        farmId: helpers.isValidId,
        userId: helpers.isValidId,
        farmRoleId: helpers.isValidId
    }, function(params) {
        var access = {};
        access.farm = {id: params.farmId};
        access.requiredPermissions = [permissions.kEditFarmPermissions, permissions.kEditFarms];

        responder.authAndRespond(req, res, access, function() {
            return {
                permission: FarmPermissionController.createFarmPermission(params.userId, params.farmId, params.farmRoleId)
            };
        });
    });
});

/** 
 * @api {get} /farm-permissions/:permission_id Get Farm Permission
 * @apiName GetFarmPermission
 * @apiGroup Farm-Permissions
 *
 * @apiParam {permission_id} the id of the permission to get.
 * 
 * @apiError PermissionNotFound Permission doesn't exist.
 * @apiErrorExample PermissionNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "PermissionNotFound"
 *      }
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *              "id": 1,
 *              "UserId": 1,
 *              "FarmId": 1,
 *              "FarmRoleId": 1
 *      }
 */
router.get('/:permission_id',  function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        includes: possibleIncludes
    });

    var query = {};
    query.include = userQuery.includeList;
    query.where = {id: req.params.measurement_id};

    responder.respond(res, {
        permission: FarmPermissionController.getFarmPermission(req.params.permission_id)
            .then(function(permission) {
                var access = getPermissions(userQuery, permission.farmId, permission.userId);
                req.user.requiresAccess(access);

                return permission;
            })
    });
});

/**
 * @api {put} /farm-permissions/:permission_id Update Farm Permission
 * @apiName PutFarmPermission
 * @apiGroup Farm-Permissions
 *
 * @apiParam {Number} permission_id the id of the permission to update.
 * @apiParam {Number} farmPermissionId ...
 * @apiParam {Number} farmRoleId ...
 * 
 * @apiError NoPermissionId Permission id not included in request body.
 * @apiErrorExample NoPermissionId
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "permission Id not provided"
 *      }
 * 
 * @apiError NoFarmRoleId Farm Role id not included in request body.
 * @apiErrorExample NoFarmRoleId
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "farmRoleId not provided""
 *      }
 * 
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Updated Farm Permission!",
 *          "permission":
 *          {
 *              "id": 1,
 *              "UserId": 1,
 *              "FarmId": 1,
 *              "FarmRoleId": 1
 *          }
 *      }
 */
router.put('/:permission_id',  function(req, res) {

    helpers.validateRequestBody(req, res, {
        farmRoleId: helpers.isValidId
    }, function(params) {
       responder.respond(res, {
           permission: FarmPermissionController.updateFarmPermission({where: {id: req.params.permission_id}}, params, function(permission) {
               var access = {};
               access.farm = {id: permission.farmId};
               access.requiredPermissions = [permissions.kEditFarmPermissions];

               return req.user.requiresAccess(access);
           })
       });
    });
});

/**
 * @api {delete} /farm-permissions/:permission_id Remove Farm Permission
 * @apiName RemoveFarmPermission
 * @apiGroup Farm-Permissions
 *
 * @apiParam {Number} permission_id the id of the permission to update.
 *
 * @apiError PermissionNotFound Permission doesn't exist.
 * @apiErrorExample PermissionNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "PermissionNotFound"
 *      }
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Removed Farm Permission!"
 *      }
 */
router.delete('/:permission_id',  function(req, res) {

    console.log('API - Delete Farm');

    responder.respond(res, {
        promise: FarmPermissionController.removeFarmPermission({where: {id: req.params.permission_id}}, function(permission) {
            var access = {};
            access.farm = {id: permission.farmId};
            access.requiredPermissions = [permissions.kEditFarmPermissions];

            return req.user.requiresAccess(access);
        })
    });
});


module.exports = router;
