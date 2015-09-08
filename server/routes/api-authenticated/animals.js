/**
 * API for animals
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
var defined = require('../../utils/defined');
var helpers = agquire('ag/routes/utils/helpers');
var permissions = require('../utils/permissions');
var AnimalController = agquire('ag/db/controllers/AnimalController');
var responder = agquire('ag/routes/utils/responder');
var Transaction = agquire('ag/db/controllers/Transaction');

var possibleIncludes = ['farm', 'herd', 'measurements'];

var getPermissions = function(userQuery, farmId) {

    var access = {};
    access.farm = {id: farmId};
    access.requiredPermissions = [permissions.kViewFarmAnimals];

    // If they're allowed to view animals, we must also let them do herd
    // predicates. There's no point in NOT allowing this because they could
    // derive herd information from the returned animals, anyway.
    // So we ignore params.herdId

    // However, viewing herd definitions require permissions
    if (userQuery && userQuery.include.herd) {
        access.requiredPermissions.push(permissions.kViewFarmHerds);
    }

    if (userQuery && userQuery.include.farm) {
        // If they're doing a query for all animals, and they want farms too,
        // then they better have permission. If it's a user doing a query
        // on a specific farm, then of course they have this permission.
        access.requiredPermissions.push(permissions.kViewFarms);
    }

    if (userQuery && userQuery.include.measurement) {
        access.requiredPermissions.push(permissions.kViewFarmMeasurements);
    }

    return access;
};


/**
 * @api {get} /animals Get all the animals.
 * @apiName GetAnimals
 * @apiGroup Animals
 * @apiParam {Number} farm Id of a farm - user must have access to view animals on this farm
 * @apiParam {Number} [herd] Id of a herd.
 * @apiParam {String} [eid] eid of an animal.
 * @apiParam {String} [vid] vid of an animal.
 * @apiParam {Number} [limit] Number of results to limit the query
 * @apiParam {Number} [offset] Offset from start of query result
 * @apiParam {String} [include] list of objects to include in response (farm,herd,measurements)
 *
 * @apiSuccess {Object[]} animals Array of animals.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "animals": [
 *          {
 *          id: 1
 *          vid: 1
 *          eid: 1
 *          herdId: 1
 *          farmId: null
 *          },
 *       ]
 *     }
 */
router.get('/',   function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        entities: ['farm', 'herd'],
        includes: possibleIncludes,
        other: ['limit', 'offset', 'eid', 'vid']
    });

    var query = {};
    query.include = userQuery.includeList;
    query.where = {};

    helpers.setIfExists("herdId", query.where, userQuery);
    helpers.setIfExists("farmId", query.where, userQuery);
    helpers.setIfExists("vid", query.where, userQuery);
    helpers.setIfExists("eid", query.where, userQuery);

    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    var params = userQuery.params;

    if (!helpers.isValidId(params.farmId)) {
        if (params.eid || params.vid || params.herdId) {
            return responder.rejectWithUserError(res, responder.errors.bad_request, 'A farmId is required if you specified eid, vid or herdId');
        }
    }

    var access = getPermissions(userQuery, params.farmId);
    responder.authAndRespond(req, res, access, function() {
       return {
           animals: AnimalController.getAnimals(query)
       };
    });
});


/**
 * @api {get} /animals/count Get animal count.
 * @apiName GetAnimalCount
 * @apiGroup Animals
 * @apiParam {Number} farm Id of a farm - requesting user must have permission to view animals on this farm
 * @apiParam {Number} [herd] Id of a herd.
 *
 * @apiSuccess {Number} count Number of animals.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "count": 13
 *     }
 */
router.get('/count/', function(req, res) {
    var userQuery = helpers.parseQuery(req.query, {
        entities: ['farm', 'herd']
    });

    var params = userQuery.params;

    if (!helpers.isValidId(params.farmId)) {
        return responder.rejectWithUserError(res, responder.errors.missing_field, "farmId");
    }

    var query = {};
    query.where = {};

    helpers.setIfExists("herdId", query.where, userQuery);
    helpers.setIfExists("farmId", query.where, userQuery);

    var access = getPermissions(null, params.farmId);
    responder.authAndRespond(req, res, access, function() {
        return {
            count: AnimalController.countAnimals(query)
        };
    });
});


/**
 * @api {post} /animals Create an animal
 * @apiName CreateAnimal
 * @apiGroup Animals
 * @apiParam {Number} farm Id of a farm - user must have access to view animals on this farm
 * @apiParam {Number} [herd] Id of a herd.
 * @apiParam {String} [eid] eid of an animal.
 * @apiParam {String} [vid] vid of an animal - required if no eid is required
 *
 * @apiSuccess {Object} animal.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "animal":
 *          {
 *          id: 1
 *          vid: 1
 *          eid: 1
 *          herdId: 1
 *          farmId: null
 *          }
 *     }
 */
router.post('/',  function(req, res) {

    helpers.validateRequestBody(req, res, {
        farmId: helpers.isValidId,
        herdId: helpers.optional(helpers.isValidId),
        eid: helpers.optional(helpers.isValidString),
        vid: helpers.optional(helpers.isValidString)
    }, function(params) {
        var access = {};
        access.farm = {id: params.farmId};
        access.requiredPermissions = [permissions.kEditFarmAnimals];

        if (defined(params.herdId)) {
            access.requiredPermissions.push(permissions.kEditFarmHerds);
        }

        responder.authAndRespond(req, res, access, function() {
           return {
               animal: AnimalController.getOrCreateAnimal(null, params.farmId, params.herdId, params.eid, params.vid)
           };
        });
    });
});



/**
 * @api {get} /animals/:animalId Get an animal by id
 * @apiName GetAnimal
 * @apiGroup Animals
 * @apiParam {Number} animalId Id of an animal
 * @apiParam {String} [include] list of objects to include in response (farm,herd,measurements)
 *
 * @apiSuccess {Object} animal the animal with specified Id
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "animal":
 *          {
 *          id: 1
 *          vid: 1
 *          eid: 1
 *          herdId: 1
 *          farmId: null
 *          farm: { ... }
 *          }
 *     }
 */
router.get('/:animal_id',  function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        includes: possibleIncludes
    });

    var query = {};
    query.include = userQuery.includeList;
    query.where = {id: req.params.animal_id};

    var promise = AnimalController.getAnimal(query).then(function(animal) {
        var access = getPermissions(userQuery, animal.farmId);
        req.user.requiresAccess(access);

        return animal;
    });

    responder.respond(res, {animal: promise});
});


/**
 * @api {put} /animals/:animalId Update an animal
 * @apiName UpdateAnimal
 * @apiGroup Animals
 * @apiParam {Number} animalId Id of the animal to update
 * @apiParam {Number} [farm] Id of a farm - user must have access to edit animals on this farm as well as the animals current farm
 * @apiParam {Number} [herd] Id of a herd.
 * @apiParam {String} [eid] eid of an animal.
 * @apiParam {String} [vid] vid of an animal.
 * @apiParam {String} [sourceAnimalId] id of an animal to merge with the current animal.  When sourceAnimalId is provided, all other parameters will be ignored. VID, herdId, and all measurements from the source animal will be added to the animal being updated. sourceAnimal will be removed when the transaction is successful. The eid of the animal being updated will be retained. The farmId of sourceAnimal must be the same as the animal being updated.
 *
 * @apiSuccess {Object} animal the animal with updated values
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "animal":
 *          {
 *          id: 1
 *          vid: 1
 *          eid: 1
 *          herdId: 1
 *          farmId: null
 *          farm: { ... }
 *          }
 *     }
 */
router.put('/:animal_id',  function(req, res) {

    helpers.validateRequestBody(req, res, {
        herdId: helpers.optional(helpers.isValidId),
        farmId: helpers.optional(helpers.isValidId),
        vid: helpers.optional(helpers.isValidString),
        sourceAnimalId: helpers.optional(helpers.isValidId)
    }, function(params) {

        var promise = null;

        if (helpers.exists(params.sourceAnimalId)) {

            promise = Transaction.begin(function() {

                return AnimalController.mergeAnimals(req.params.animal_id, params.sourceAnimalId, function(x, mode) {
                    var access = {};
                    if (mode === 'animals') {
                        var src = x[0], dst = x[1];

                        access.farm = {id: src.farmId};
                        access.requiredPermissions = [permissions.kEditFarmAnimals];

                        if (permissions.wouldRequire(src.herdId, dst.herdId)) {
                            access.requiredPermissions.push(permissions.kEditFarmHerds);
                        }
                    } else if (mode === 'measurements') {
                        // ignore for now
                    }

                    return req.user.requiresAccess(access);
                });
            });
        } else {
            promise = AnimalController.updateAnimal(req.params.animal_id, params, function(animal) {
                // pre update
                var accessList = [];

                // They need access to the farm the animal is currently on
                var currentAccess = {};
                currentAccess.farm = {id: animal.farmId};

                var requiredPermissions = [permissions.kEditFarmAnimals];

                if (permissions.wouldRequire(animal.herdId, params.herdId)) {
                    requiredPermissions.push(permissions.kEditFarmHerds);
                }

                currentAccess.requiredPermissions = requiredPermissions;
                accessList.push(currentAccess);

                if (permissions.wouldRequire(animal.farmId, params.farmId)) {
                    // They are wanting to change the farm, so must have access to the new farm, too
                    var newAccess = {};
                    newAccess.farm = {id: params.farmId};
                    newAccess.requiredPermissions = requiredPermissions;

                    accessList.push(newAccess);
                }

                return req.user.requiresMultipleAccess(accessList);
            });
        }

        responder.respond(res, {animal: promise});
    });
});


/**
 * @api {delete} /animals/:animalId Delete an animal
 * @apiName DeleteAnimal
 * @apiGroup Animals
 * @apiParam {Number} animalId Id of an animal to delete
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     }
 */
router.delete('/:animal_id',  function(req, res) {

    var promise = AnimalController.removeAnimal(req.params.animal_id, function(animal) {
        var access = {};
        access.farm = {id: animal.farmId};
        access.requiredPermissions = [permissions.kEditFarmAnimals];

        return req.user.requiresAccess(access);
    });

    responder.respond(res, {promise: promise});
});

module.exports = router;
