/**
 * API for herds
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

var HerdController = agquire('ag/db/controllers/HerdController');
var permissions = require('../utils/permissions');
var helpers = agquire('ag/routes/utils/helpers');
var responder = agquire('ag/routes/utils/responder');

/**
 * @api {get} /herds/ List all Herds
 * @apiName GetHerds
 * @apiGroup Herds
 *
 * @apiParam {String} [farm] Id of a farm to filter the herds list by
 * @apiParam {String} [include] list of objects to include in response (farm)
 *
 * @apiSuccess {Object[]} herds Array of herds.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "herds": [
 *          {
 *          id: 1,
 *          name: "Demo Herd",
 *          FarmId: 1
 *          }
 *       ]
 *     }
 *
 * @apiError HerdNotFound No herds could be found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "HerdNotFound"
 *     }
 *
 * @apiUse AuthorisationError
 */
router.get('/', function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        entities: ['farm'],
        includes: ['farm'],
        other: ['offset', 'limit']
    });

    var query = {};

    query.include = userQuery.includeList;

    query.where = {};

    helpers.setIfExists("farmId", query.where, userQuery);

    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    var access = {};

    access.requiredPermissions = [permissions.kViewFarmHerds];

    if (userQuery.include.farm) {
        access.requiredPermissions.push(permissions.kViewFarms);
    }

    if(userQuery.params.farmId){
        access.farm = {id: userQuery.params.farmId};
    }

    responder.authAndRespond(req, res, access, function() {
        return {
            herds: HerdController.getHerds(query)
        };
    });
});


/**
 * @api {post} /herds/ Create a Herd
 * @apiName CreateAHerd
 * @apiGroup Herds
 *
 * @apiParam {String} [name] Name of the new herd.
 * @apiParam {Number} [farmId] Id of the farm this herd will belong to
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
        farmId: helpers.isValidId,
        name: helpers.isValidString
    }, function(params) {
        var access = {};
        access.requiredPermissions = [permissions.kEditFarmHerds];
        access.farm = {id: params.farmId};

        responder.authAndRespond(req, res, access, function() {
            return {
                herd: HerdController.createHerd(params.farmId, params.name)
            };
        });
    });
});


router.get('/:herd_id', function(req, res) {

    var promise = HerdController.getHerd(req.params.herd_id)
        .then(function(herd) {
            var access = {};
            access.requiredPermissions = [permissions.kViewFarmHerds];
            access.farm = {id: herd.farmId};

            req.user.requiresAccess(access);

            return herd;
        });

    responder.respond(res, {
        herd: promise
    });
});


router.put('/:herd_id', function(req, res) {

    helpers.validateRequestBody(req, res, {
        name: helpers.isValidString
    }, function(params) {

        responder.respond(res, {
            herd: HerdController.updateHerd(req.params.herd_id, {
                name: params.name
            }, function(herd) {
                var access = {};
                access.requiredPermissions = [permissions.kEditFarmHerds];
                access.farm = {id: herd.farmId};

                return req.user.requiresAccess(access);
            })
        });

    });
});


router.delete('/:herd_id', function(req, res) {

    responder.respond(res, {
        promise: HerdController.removeHerd(req.params.herd_id, function(herd) {
            var access = {};
            access.requiredPermissions = [permissions.kEditFarmHerds];
            access.farm = {id: herd.farmId};

            return req.user.requiresAccess(access);
        })
    });

});


module.exports = router;
