/**
 * API for measurements
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
var permissions = require('../utils/permissions');
var helpers = agquire('ag/routes/utils/helpers');
var defined = require('../../utils/defined');
var responder = agquire('ag/routes/utils/responder');

var MeasurementController = agquire('ag/db/controllers/MeasurementController');
var AnimalController = agquire('ag/db/controllers/AnimalController');

var possibleIncludes = ['user', 'algorithm', 'animal'];

var getPermissions = function(userQuery, farmId) {

    var access = {};
    access.farm = {id: farmId};
    access.requiredPermissions = [permissions.kViewFarmMeasurements];

    if (userQuery && userQuery.include.user) {
        access.requiredPermissions.push(permissions.kViewGlobalUsers);
    }

    if (userQuery && userQuery.include.algorithm) {
        access.requiredPermissions.push(permissions.kViewGlobalAlgorithms);
    }

    if (userQuery && userQuery.include.animal) {
        access.requiredPermissions.push(permissions.kViewFarmAnimals);
    }

    return access;
};

/**
 * @api {get} /measurements/ List all Measurements
 * @apiName GetMeasurements
 * @apiGroup Measurements
 *
 * @apiParam {Number} [animal] Id of an animal.
 * @apiParam {Number} [algorithm] Id of an algorithm.
 * @apiParam {Number} [herd] Id of a herd.
 * @apiParam {Number} [farm] Id of a farm.
 * @apiParam {Number} [limit] Number of results to limit the query
 * @apiParam {Number} [offset] Offset from start of query result
 * @apiParam {Number} [startDate] filter from this date onwards - should be milliseconds since epoc (1,1,1970) UTC
 * @apiParam {Number} [endDate] filter up to this date - should be milliseconds since epoc (1,1,1970) UTC
 * @apiParam {String} [include] list of objects to include in response (user,algorithm,animal)
 *
 * @apiSuccess {Object[]} measurements Array of measurements.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "measurements": [
 *          {
 *          id: 1
 *          algorithmID: 1
 *          userID: 1
 *          animalID: 1
 *          w05: null
 *          w25: null
 *          w50: 5
 *          w75: null
 *          w95: null
 *          comment: "This animal is starting to look underweight"
 *          },
  *         {
  *         id: 2
 *          algorithmID: 1
 *          userID: 1
 *          animalID: 1
 *          value1: 5.1
 *          value2: null
 *          value3: null
 *          value4: null
 *          value5: null
 *          comment:  null
 *          }
 *       ]
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "MeasurementNotFound"
 *     }
 */
router.get('/', function(req, res) {
    console.log("measurement.get");
    var userQuery = helpers.parseQuery(req.query, {
        entities: ['animal', 'algorithm', 'herd', 'farm'],
        includes: possibleIncludes,
        other: ['limit', 'offset', 'startDate', 'endDate']
    });

    var query = {};
    query.include = userQuery.includeList;

    query.where = {};
    helpers.setIfExists("animalId", query.where, userQuery);
    helpers.setIfExists("algorithmId", query.where, userQuery);
    helpers.setIfExists("herdId", query.where, userQuery, "animal.herdId");
    helpers.setIfExists("farmId", query.where, userQuery, "animal.farmId");
    helpers.setDateRangeIfExists('startDate', 'endDate', query.where, userQuery, 'timeStamp');

    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    //if farmId is provided, results are filtered by it so we can authenticate from just the farmId
    if(userQuery.params.farmId) {

        // Filtering by algorithm, herd and animal don't require permission.
        var access = getPermissions(userQuery, userQuery.params.farmId);

        responder.authAndRespond(req, res, access, function () {
            return {
                measurements: MeasurementController.getMeasurements(query)
            };
        });
    }else if(userQuery.params.animalId){

        var promise = AnimalController.getAnimal({where: {id: userQuery.params.animalId}}).then(function(animal) {

            var access = getPermissions(userQuery, animal.farmId);
            req.user.requiresAccess(access);

            return MeasurementController.getMeasurements(query);
        });

        responder.respond(res, {measurements: promise});

    }else {

        //var globalAccess = {};
        //globalAccess.requiredPermissions = [permissions.kViewFarms]; //user has global permission to view all farms
        //
        //req.user.requiresAccess(globalAccess, function (err){
        //
        //    if(err) { //no global access
                responder.rejectWithUserError(res, responder.errors.missing_field, "farmId or animalId");
        //    }else{
        //        responder.respond(res, {measurements: MeasurementController.getMeasurements(query)});
        //    }
        //});
    }
});


/**
 * @api {post} /measurements/ Create one or more measurements
 * @apiName CreateMeasurements
 * @apiGroup Measurements
 *
 * @apiParam {Number} farmId Id of the farm.
 * @apiParam {Number} [herdId] Id of the herd the animal being measured belongs to.
 * @apiParam {Number} [animalId] Id of an animal to create measurements on - required if no eid or vid supplied
 * @apiParam {String} [eid] EID of the animal this measurement is for - if an animal record does not exist with this eid, a new one will be created.
 * @apiParam {String} [vid] VID of the animal this measurement is for. Format: {colour, first letter}{number} eg. y461. If an animal record does not exist with this vid, a new one will be created.
 * @apiParam {Number} algorithmId Id of the algorithm this measurement was created with.
 * @apiParam {Number} [w05] Measurement value - values represent percentiles for a measurement with quantified uncertainty
 * @apiParam {Number} [w25] Measurement value
 * @apiParam {Number} w50 Measurement value - use w50 for measurements without quantified uncertainty
 * @apiParam {Number} [w75] Measurement value
 * @apiParam {Number} [w95] Measurement value
 * @apiParam {String} [comment] comment about the measurement
 * @apiParam {Number} [timeStamp] The time the measurement was made in number of milliseconds since 1 January, 1970 UTC
 *
 * @apiParamExample {json} Single Measurement Example:
 *     {
 *       "farmId": "1",
 *       "herdId" : "1",
 *       "eid" : ""xxxx-xxxx-xxxx
 *       "algorithmId : "2",
 *       "w05":null,
 *       "w25":null,
 *       "w50":63,
 *       "w75":null,
 *       "w95":null,
 *       "timeStamp": "1432604451",
 *       "comment" : "A comment"
 *     }
 *
 * @apiParamExample {json} Multiple Measurement Example:
 *     {
 *       "farmId": "1",
 *       "animalId" : "23",
 *       "algorithmId : "2",
 *       "measurements": [{"w05":null, "w25":null, "w50":63,"w75":null,"w95":null, "timeStamp": "1432604451"},{"w05":null, "w25":null, "w50":63,"w75":null,"w95":null, timeStamp: "1432604452"}]
 *     }
 *
 * @apiSuccess {Object[]} measurements Array of measurements if multiple measurements provided.
 * @apiSuccess {Object} measurement The created measurement - for single measurement creation
 *
 * @apiSuccessExample Multiple Measurement Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "measurements": [
 *          {
 *          id: 1
 *          algorithmID: 1
 *          userID: 1
 *          animalID: 1
 *          w05: null
 *          w25: null
 *          w50: 5
 *          w75: null
 *          w95: null
 *          comment: "This animal is starting to look underweight"
 *          },
  *         {
  *         id: 2
 *          algorithmID: 1
 *          userID: 1
 *          animalID: 1
 *          w05: null
 *          w25: null
 *          w50: 5.1
 *          w75: null
 *          w95: null
 *          comment:  null
 *          }
 *       ]
 *     }
 *
 * @apiSuccessExample Single Measurement Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "measurement":
 *          {
 *          id: 1
 *          algorithmID: 1
 *          userID: 1
 *          animalID: 1
 *          w05: null
 *          w25: null
 *          w50: 5
 *          w75: null
 *          w95: null
 *          comment: "This animal is starting to look underweight"
 *          }
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422
 *     {
 *       "error": "no farmId specified"
 *     }
 */
router.post('/', function(req, res) {

    helpers.validateRequestBody(req, res, {
        farmId: helpers.isValidId,
        algorithmId: helpers.isValidId,
        animalId: helpers.optional(helpers.isValidId),
        eid: helpers.optional(helpers.isValidString),
        vid: helpers.optional(helpers.isValidString),
        herdId: helpers.optional(helpers.isValidId),
        timeStamp: helpers.optional(helpers.exists),
        // TODO: make better validation
        measurements: helpers.optional(function(){return true;})
    }, function(params) {
        var farmID = params.farmId;
        var algorithmID = params.algorithmId;
        var userID = req.user.id;
        var animalId = params.animalId;
        var measurementsList = params.measurements;
        var eid = params.eid;
        var vid = params.vid;
        var herdId = params.herdId;

        var access = {};
        access.farm = {id: farmID};
        access.requiredPermissions = [permissions.kEditFarmMeasurements];

        if (!defined(animalId)) {
            // We create animals if they don't exist, and this requires permission
            access.requiredPermissions.push(permissions.kEditFarmAnimals);

            if (defined(herdId)) {
                access.requiredPermissions = [permissions.kEditFarmHerds];
            }
        }

        var animalInfo;

        if(defined(animalId) || defined(eid) || defined(vid)) {
            animalInfo = {animalId: animalId, eid: eid, vid: vid, herdId: herdId};
        }else if (measurementsList){
            access.requiredPermissions.push(permissions.kEditFarmAnimals);
        }

        if (measurementsList) {

            responder.authAndRespond(req, res, access, function() {

                var Transaction = agquire('ag/db/controllers/Transaction');
                return {
                    measurements: Transaction.begin(function(t) {
                        if(animalInfo){
                            return  MeasurementController.createMeasurementsForAnimal(animalInfo, farmID, algorithmID, userID, measurementsList);
                        }else{
                            return MeasurementController.createMeasurementsForFarm(farmID, algorithmID, userID, measurementsList);
                        }
                    })
                };
            });
        } else {
            var measurementDetails = req.body;
            responder.authAndRespond(req, res, access, function() {
                return {
                    measurement: MeasurementController.createMeasurement(animalInfo, farmID, algorithmID, userID, measurementDetails)
                };
            });
        }

    });
});


/**
 * @api {get} /measurements/count/ Get measurements count based on a query
 * @apiName GetMeasurementsCount
 * @apiGroup Measurements
 *
 * @apiParam {Number} farm Id of a farm - querying user must have access to view measurements in this farm
 * @apiParam {Number} [animal] Id of an animal.
 * @apiParam {Number} [algorithm] Id of an algorithm.
 * @apiParam {Number} [herd] Id of a herd.
 * @apiParam {Number} [startDate] filter from this date onwards - should be milliseconds since epoc (1,1,1970) UTC
 * @apiParam {Number} [endDate] filter up to this date - should be milliseconds since epoc (1,1,1970) UTC
 *
 * @apiSuccess {Number} count Number of measurements found based on the specified query.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "count": 22
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "MeasurementNotFound"
 *     }
 */
router.get('/count/', function(req, res) {
    var userQuery = helpers.parseQuery(req.query, {
        other: ['startDate', 'endDate'],
        entities: ['farm', 'herd', 'animal', 'algorithm']
    });

    var params = userQuery.params;

    if (!helpers.isValidId(params.farmId)) {
        return responder.rejectWithUserError(res, responder.errors.missing_field, "farmId");
    }

    var query = {};
    query.where = {};
    query.include = ['animal'];

    helpers.setIfExists("herdId", query.where, userQuery);
    helpers.setIfExists("farmId", query.where, userQuery);
    helpers.setIfExists("animalId", query.where, userQuery);
    helpers.setIfExists("algorithmId", query.where, userQuery);
    helpers.setDateRangeIfExists('startDate', 'endDate', query.where, userQuery, 'timeStamp');

    var access = getPermissions(null, params.farmId);
    responder.authAndRespond(req, res, access, function() {
        return {
            count: MeasurementController.countMeasurements(query)
        };
    });
});

var lastSets = function(req, res) {
    var userQuery = helpers.parseQuery(req.query, {
        entities: ['farm', 'herd', 'algorithm'],
        other: ['window', 'limit']
    });

    var params = userQuery.params;

    if (!helpers.isValidId(params.farmId)) {
        return responder.rejectWithUserError(res, responder.errors.missing_field, "farmId");
    }

    if (!isNaN(params.window)) {
        if (params.window > 24 * 60) {
            return responder.rejectWithUserError(res, responder.errors.bad_request, "window cannot exceed 24 hours");
        }
    } else {
        params.window = 60;
    }

    if (!isNaN(params.limit)) {
        if (params.limit > 10) {
            return responder.rejectWithUserError(res, responder.errors.bad_request, 'limit cannot exceed 10');
        }
    } else {
        params.limit = 1;
    }

    var query = {};
    query.where = {};
    helpers.setIfExists("herdId", query.where, userQuery);
    helpers.setIfExists("farmId", query.where, userQuery);
    helpers.setIfExists("algorithmId", query.where, userQuery);

    var access = getPermissions(userQuery, userQuery.params.farmId);
    responder.authAndRespond(req, res, access, function() {
        return {
            promise: MeasurementController.findRecentMeasurements(query, params.window, params.limit)
        };
    });

};

/**
 * @apiDefine measurements_sets
 * @api {get} /measurements/sets/ Get dates of recent measurements within some range
 * @apiName GetMeasurementsLastSetDates
 * @apiGroup Measurements
 *
 * @apiParam {Number} farm Id of a farm - querying user must have access to view measurements in this farm
 * @apiParam {Number} [herdId] Id of a herd to restrict to.
 * @apiParam {Number} [algorithm] Id of an algorithm to restrict to.
 * @apiParam {Number} [window] Number of minutes to that defines recentness (default: 60, max: 1,440)
 * @apiParam {Number} [limit] Number of seperate windows (default: 1, max: 10)
 *
 * @apiSuccess {Object} Date range and number of measurements
 *
 * @apiSuccessExample Success Response:
 *     HTTP/1.1 200 OK
 *   {
 *      "start": "2015-07-29T11:28:40.516Z",
 *      "end": "2015-07-29T12:28:40.516Z",
 *      "count": 4
 *   }
 *
 */
router.get('/sets', lastSets);

/**
 * @api {get} {get} /measurements/last-set-dates/
 * @apiUse measurements_sets
 */
router.get('/last-set-dates', lastSets);

/**
 * @api {get} /measurements/:measurement_id Get a single measurement
 * @apiName GetMeasurement
 * @apiGroup Measurements
 *
 * @apiParam {Number} [measurement_id] Id of the measurement.
 *
 * @apiSuccess {Number} id Id of the measurement.
 * @apiSuccess {Number} animalId Id of the animal this measurement was made on.
 * @apiSuccess {Number} userId Id of the user who made the measurement.
 * @apiSuccess {Number} algorithmId Id of the algorithm used to make this measurement.
 * @apiSuccess {Number} w05 Measurement value.
 * @apiSuccess {Number} w25 Measurement value.
 * @apiSuccess {Number} w50 Measurement value.
 * @apiSuccess {Number} w75 Measurement value.
 * @apiSuccess {Number} w95 Measurement value.
 * @apiSuccess {String} comment A comment about the measurement.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     id: 1
 *     algorithmID: 1
 *     userID: 1
 *     animalID: 1
 *     w05: 496
 *     w25: null
 *     w50: 510
 *     w75: null
 *     w95: 524
 *     comment: "This animal is starting to look underweight"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "MeasurementNotFound"
 *     }
 */
router.get('/:measurement_id', function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        includes: possibleIncludes
    });

    // We need the animal for permission checking
    var removeAnimal = false;
    if (!userQuery.include.animal) {
        userQuery.include.animal = true;
        userQuery.includeList.push('animal');

        // user doesn't want it
        removeAnimal = true;
    }

    var query = {};
    query.include = userQuery.includeList;
    query.where = {id: req.params.measurement_id};

    responder.respond(res, {
        measurement: MeasurementController.getMeasurement(query)
            .then(function(measurement) {

                var access = getPermissions(userQuery, measurement.animal.farmId);
                req.user.requiresAccess(access);

                if (removeAnimal) {
                    delete measurement.animal;
                }

                return measurement;
            })
    });
});

/**
 * @api {delete} /measurements/:measurement_id Remove a single measurement
 * @apiName DeleteMeasurement
 * @apiGroup Measurements
 *
 * @apiParam {Number} [measurement_id] Id of the measurement you wish to remove.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         message: 'Removed Measurement!'
 *     }
 */

router.delete('/:measurement_id', function (req, res) {

    responder.respond(res, {
        promise: MeasurementController.removeMeasurement({
                where: {id: req.params.measurement_id},
                include: ['animal']
            }, function(measurement) {
                var access = {};
                access.farm = {id: measurement.animal.farmId};
                access.requiredPermissions = [permissions.kEditFarmMeasurements];

                return req.user.requiresAccess(access);
            })
    });
});

module.exports = router;
