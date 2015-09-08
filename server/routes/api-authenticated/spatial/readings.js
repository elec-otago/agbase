/**
 * API for spatial readings
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller.
 *
 **/
var express = require('express');
var ReadingController = agquire('ag/db/controllers/ReadingController');
var PaddockController = agquire('ag/db/controllers/PaddockController');

var permissions = require('../../utils/permissions');
var responder = agquire('ag/routes/utils/responder');

var router = express.Router();

/*
 Route                  HTTP Verb       Description
 ================================================================
 /api/readings              GET         Get pasture measurements.
 /api/readings              POST        Create a pasture measurement.
 /api/readings/:object_id   PUT         Update a pasture measurement.
 /api/readings/:object_id   DELETE      Delete a pasture measurement.
 */

/**
 * @api {post} /spatial/readings/ Create a Pasture Measurement
 * @apiName PostPastureMeasurements
 * @apiGroup Pasture Measurements
 *
 * @apiParam {String} paddock_oid id of paddock from which the pasture measurement was taken.
 * @apiParam {Number} length The length of the pasture measurement.
 * @apiParam {Number[]} location The location from which the pasture measurement was taken.  The positions longitude must be the first entry.
 * @apiParam {Number} [altitude] The altitude from which the pasture measurement was taken.
 * @apiParam {Number} [algoId] The id of the algorithm used to take the pasture measurement.
 * @apiParam {Date} [created] The date that the pasture measurement was taken.
 * @apiParam {Date} [updated] The date that the pasture measurement was updated.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "length": 1,
 *          "paddock_oid": "12345678ff",
 *          "location": [150, 0],
 *          "created": "2015-01-13",
 *          "updated": "2015-01-13"
 *      }
 * 
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *        "measurement":
 *        {
 *              "_id": "ff87654321",
 *              "length": 1,
 *              "paddock_oid": "12345678ff",
 *              "location": [150, 0],
 *              "created": "2015-01-13",
 *              "updated": "2015-01-13"
 *        }
 *    }
 * 
 * @apiErrorExample Error-Response
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "error message"herd
 *      }
 */
router.post('/', function(req, res) {
    
    var readingDetails = req.body;
    
    return PaddockController.getPaddockFarm(readingDetails.paddock_oid)
    .then(function(farmId) {

        var access = {};
        access.requiredPermissions = [permissions.kEditFarmPermissions];
        access.farm = {id: farmId};

        responder.authAndRespond(req, res, access, function() {
            return { measurement: ReadingController.createReading(readingDetails) }
        });
    });
    /*
    return ReadingController.createReading(readingDetails)
    .then(function(reading) {
        return res.send({ message: "Pasture Measurement Saved", data: reading});
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
    */
});

/**
 * Update reading length
 */

/**
 * @api {put} /spatial/readings/:object_id Update a Pasture Measurement
 * @apiName PutPastureMeasurements
 * @apiGroup Pasture Measurements
 *
 * @apiParam {String} object_id Id of pasture measurement to update.
 * @apiParam {Number} pasturereading The updated pasture reading (See Create a Pasture Measurment).
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *        "measurement":
 *        {
 *              "_id": "Mongo primary key string",
 *              "length": 1,
 *              "paddock_oid": "12345678ff",
 *              "location": [150, 0],
 *              "date": "2015-01-13"
 *         }
 *    }
 * 
 * @apiErrorExample Error-Response
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "error message"
 *      }
 */
router.put('/:object_id', function(req, res) {

    var id = req.params.object_id;
    var readingDetails = req.body;

    /* TODO: find paddock that has measurement with object id first, THEN get the farm
    return PaddockController.getPaddockFarm(id)
    .then(function(farmId) {
        
        var access = {};
        access.requiredPermissions = [permissions.kEditFarmPermissions];
        access.farm = {id: farmId};
        
        responder.authAndRespond(req, res, access, function() {
            return { measurement: ReadingController.updateReading(id, readingDetails) }
        });
    });
    */
    
    return ReadingController.updateReading(id, readingDetails)
    .then(function(reading) {
        return res.send({measurement: reading});        
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
    
});

/**
 * Delete reading
 */

/**
 * @api {delete} /spatial/readings/:object_id Delete a Pasture Measurement
 * @apiName DeletePastureMeasurements
 * @apiGroup Pasture Measurements
 *
 * @apiParam {String} object_id Id of Pasture Measurement to delete.
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *        "result": 1
 *    }
 *
 * @apiErrorExample Error-Response
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "error message"
 *      }
 */
router.delete('/:object_id', function(req, res) {
    
   
    var id = req.params.object_id;
        
    return ReadingController.deleteReading(id).then(function() {
        return res.send({result: 1});
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
    
});

/**
 * Get readings.
 */

/**
 * @api {get} /spatial/readings/ Get Pasture Measurements
 * @apiName GetPastureMeasurements
 * @apiGroup Pasture Measurements
 *
 * @apiParam {String} [paddock] Id of paddock that contains requested pasture measurements.
 * @apiParam {String} [start_date] Start date to look for pasture measurements.
 * @apiParam {String} [end_date] End date to look for pasture measurements. 
 * @apiParam {Number} [limit] Maximum number of results that the query should return.  The AgBase API cannot return more than 1000 results.
 * @apiParam {Number} [offset] The offset from the start of the query result.
 * 
 * @apiSuccessExample Success-Response
 *  {
 *      "measurements": 
 *          [
 *              {
 *                  "_id": "Mongo primary key string",
 *                  "length": 1,
 *                  "paddock_oid": "12345678ff",
 *                  "location": [150, 0],
 *                  "date": "2015-01-13"
 *             }
 *          ]
 *      }
 *  }
 */
router.get('/', function(req, res) {

    var params = req.query;
    var paddock;
    
    if(params.paddock) { paddock = [params.paddock]; }
    
    var access = {};
    access.requiredPermissions = [permissions.kViewFarmPermissions];
    
    // return pasture measurements for paddock when a paddock id is given
    // as a parameter.
    if(params.paddock) {
    
        return PaddockController.getPaddockFarm(params.paddock)
        .then(function(farmId) {        
            
            access.farm = {id: farmId};
                    
            responder.authAndRespond(req, res, access, function() {                
                return { measurements: ReadingController.getReadings(paddock, params.start_date, 
                         params.end_date, params.algorithm_id, params.limit, params.offset) }
            });
        });
    }
    // return pasture measurements for every farm the account has access too.
    else {    
        responder.authAndRespond(req, res, access, function() {            
            return { measurements: ReadingController.getReadings(paddock, params.start_date, 
                     params.end_date, params.algorithm_id, params.limit, params.offset) }                    
        });
    }   
});

var lastSets = function(req, res) {
    var params = req.query;
    
    return ReadingController.getSetDates(params)
    .then(function(dates) {
        console.log("returning dates");
        return res.send(dates);
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
};

/**
 * @api {get} /spatial/readings/sets Get the date bounds of the last set of recorded pasture measurements
 * @apiName LastSetPastureMeasurements
 * @apiGroup LastSetPastureMeasurements
 * 
 * @apiParam {String} [paddock] Id of paddock that contains pasture measurements
 * @apiParam {String} [algorithm] Id of algorithm used to take pasture measurements
 * @apiParam {Number} [window] Number of minutes to that defines recentness (default: 60, max: 1,440)
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
 */
router.get('/sets', lastSets);
router.get('/last-set-dates', lastSets);



/**
 * Count readings
 */

/**
 * @api {get} /spatial/readings/count Get a count of Pasture Measurements
 * @apiName CountPastureMeasurements
 * @apiGroup Pasture Measurements
 *
 * @apiParam {String} [paddock] Id of paddock that contain requested pasture measurements.
 * @apiParam {String} [start_date] Start date to look for pasture measurements.
 * @apiParam {String} [end_date] End date to look for pasture measurements.
 *
 * @apiSuccessExample Success-Response
 *  {
 *      "count": <number of pasture measurements>
 *  }
 */
router.get('/count', function(req,res) {
    var paddocks;
    var params = req.query;
    
    if(params.paddock) { paddocks = params.paddock.split(','); }
    
    return ReadingController.countReadings(paddocks, params.start_date, params.end_date,
                                           params.algorithm_id)
    .then(function(count) {
        return res.send({count: count});
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
});
module.exports = router;