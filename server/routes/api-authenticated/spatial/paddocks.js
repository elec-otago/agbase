/**
 * API for paddock information
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
var Paddock = agquire('ag/db/models-mongo/paddock');
var Reading = agquire('ag/db/models-mongo/reading');

var permissions = require('../../utils/permissions');
var responder = agquire('ag/routes/utils/responder');

var PaddockController = agquire('ag/db/controllers/PaddockController');

var router = express.Router();

/*
 Route                  HTTP Verb       Description
 =====================================================
 /api/paddocks              GET         Get paddocks.
 /api/paddocks/:object_id   GET         Get single paddock.
 /api/paddocks              POST        Create a paddock.
 /api/paddocks/:object_id   PUT         Update a paddock.
 /api/paddocks/:object_id   DELETE      Delete a paddock.
 */

/**
 * @api {post} /spatial/paddocks/ Create a Paddock
 * @apiName PostPaddocks
 * @apiGroup Paddocks
 *
 * @apiParam {String} name Name of new paddock.
 * @apiParam {Number} farm_id Id of farm that this paddock belongs to. 
 * @apiParam {Object} loc contains coordinates of paddock. Must be a GeoJSON Polygon (see example).
 * @apiParam {String} [created] Timestamp of paddock creation time.
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "Demo Paddock"
 *          "farm_id": 1
 *          "loc": {
 *              "coordinates":[
 *                  [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
 *              ]
 *          }
 *          "created": "2015-04-19"
 *      }
 * 
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "paddock": 
 *          {
 *              "_id": "primary_key_string",
 *              "name": "Demo Paddock",
 *              "farm_id": 1,
 *              "created": "2015-04-19",
 *              "updated": "2015-04-19",
 *              "loc" {
 *                  "type": "Polygon",
 *                  "coordinates": [
 *                      [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
 *                  ]                  
 *              }
 *          }
 *      }
 * 
 * @apiError IncompleteRequest Request body is missing required fields.
 * @apiErrorExample IncompleteRequest
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          error: "Missing field response message"
 *      }
 */
router.post('/', function(req, res) {

    var paddockDetails = req.body;
    
    var access = {};
    access.requiredPermissions = [permissions.kEditFarmPermissions];
    access.farm = {id: paddockDetails.farm_id};
    
    responder.authAndRespond(req, res, access, function() {
        return {
            paddock: PaddockController.createPaddock(paddockDetails)
        }
    });
});

/**
 * @api {put} /spatial/paddocks/:id Update a Paddock
 * @apiName PutPaddocks
 * @apiGroup Paddocks
 *
 * @apiParam {string} id Primary key of updated paddock.
 * @apiParam (paddock) {String} [name] Name of updated paddock.
 * @apiParam (paddock) {Object} [loc] Corners of updated paddock. Must be a GeoJSON Polygon (see example).
 * @apiParam (paddock) {Object} [updated] Timestamp of update time.
 * 
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "paddock": 
 *          {
 *              "_id": "primary_key_string",
 *              "name": "Demo Paddock",
 *              "farm_id": 1,
 *              "created": "2015-04-19"
 *              "loc" 
 *              {
 *                  "type": "Polygon",
 *                  "coordinates":
 *                  [
 *                      [
 *                          [0, 0], [0, 1], [1, 1], [1, 0], [0, 0]
 *                      ]
 *                  ]                  
 *              }
 *          }
 *      }
 * 
 * @apiError PaddockNotFound could find paddock with object_id parameter.
 * @apiErrorExample PaddockNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          error: "Paddock Not Found"
 *      }
 */
router.put('/:object_id', function(req, res) {

    var id = req.params.object_id;
    var paddockDetails = req.body;
       
    // get paddock first for purpose of checking farm permissions
    return PaddockController.getOnePaddock(id)
    .then(function(paddock) {

        var access = {};
        access.requiredPermissions = [permissions.kEditFarmPermissions];
        access.farm = {id: paddockDetails.farm_id};
            
        responder.authAndRespond(req, res, access, function() {
            return {
                paddock: PaddockController.updatePaddock(id, paddockDetails)
            }    
        });
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
    
});

/**
 * Delete paddock
 */

/**
 * @api {delete} /spatial/paddocks/:id Delete a Paddock
 * @apiName DeletePaddocks
 * @apiGroup Paddocks
 *
 * @apiParam {string} id Primary key of paddock to delete.
 * 
 * @apiError PaddockNotFound could find paddock with object_id parameter.
 * @apiErrorExample PaddockNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          error: "Paddock Not Found"
 *      }
 * 
 * @apiError RemovePastureMeasurementError couldn't remove pasture measurements that belong to paddock.
 * @apiErrorExample RemovePastureMeasurementError
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          error: "Couldn't remove pasture measurements, operation aborted"
 *      }
 * 
 * @apiSuccessExample
 *      HTTP/1.1 200 OK
 *      {
 *          "result": 1
 *      }         
 */
router.delete('/:object_id', function(req, res) {

    var id = req.params.object_id;

    // get paddock first for purpose of checking farm permissions
    return PaddockController.getOnePaddock(id)
    .then(function(paddock) {

        var access = {};
        access.requiredPermissions = [permissions.kEditFarmPermissions];
        access.farm = {id: paddock.farm_id};    
           
        responder.authAndRespond(req, res, access, function() {
            return {
                result: PaddockController.deletePaddock(id)
            }    
         });
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
    /*
    return PaddockController.deletePaddock(id).then(function() {
        return res.send({message: 'Paddock Deleted'});
    })
    .catch(function(err){
        return res.status(422).send({error: err.message});
    });
    */
});

/**
 * Get paddocks. 
 */

/**
 * @api {get} /spatial/paddocks/ Get Paddocks
 * @apiName GetPaddocks
 * @apiGroup Paddocks
 *
 * @apiParam {Number} [include] List of objects to include in response (farm).
 * @apiParam {Number} [farm_id] Id of farm that contains requested paddocks.
 * @apiParam {Number} [limit] Maximum number of results that the query should return.  The AgBase API cannot return more than 1000 results.
 * @apiParam {Number} [offset] The offset from the start of the query result.
 * @apiParam {String} [id] Id of paddock to return.
 *
 * @apiErrorExample Error-Response
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "error message"
 *      }
 * 
 * @apiSuccessExample
 *      HTTP/1.1 200 OK
 *      {
 *          "paddocks": 
 *          [
 *               {
 *                   "_id": "primary_key_string",
 *                   "name": "Demo Paddock",
 *                   "farm_id": 1,
 *                   "created": "2015-04-19"
 *                   "loc":
 *                   {
 *                       "type": "Polygon",
 *                       "coordinates":
 *                       [
 *                           [
 *                               [0, 0], [0, 1], [1, 1], [1, 0], [0, 0]
 *                           ]
 *                       ]
 *                   }
 *               }
 *          ]    
 *      }         
 */
router.get('/', function(req, res) {

    var params = req.query;    
 
    var access = {};
    access.requiredPermissions = [permissions.kViewFarmPermissions];
    
    if(params.id) {     
        
        responder.authAndRespond(req, res, access, function() {
            return  {
                paddock: PaddockController.getOnePaddock(params.id)
            }
         });       
    }
    else {
        var farms;
        var limit;
        var offset;
        
        var includeFarms = params.include === "farm";
        
        if(params.farm_id) {
            farms = params.farm_id.split(',');
            access.farm = {id: farms};
            
        }
        if(params.limit) {
            limit = params.limit;
        }
        if(params.offset) {
            offset = params.offset;
        }

        responder.authAndRespond(req, res, access, function() {
            return {
                paddocks:  PaddockController.getPaddocks(includeFarms, farms, limit, offset)
            }
         });        
    }
});
    
/**
 * countPaddocks(farms)
 * @api {get} /spatial/paddocks/count/ Get a count of Paddocks
 * @apiName CountPaddocks
 * @apiGroup Paddocks
 *
 * @apiParam {Number} [farm_id] Return paddocks that belong to farms defined by farm_id.
 * 
 * @apiSuccessExample Success-Response
 * {
 *      "count":    <number of paddocks>
 * }
 */
router.get('/count/', function(req, res) {
        
    var params = req.query;
    var farms;
        
    if(params.farm_id) {
        farms = params.farm_id.split(',');
    }
    
    return PaddockController.countPaddocks(farms)
    .then(function(count) {
        return res.send({count: count});
    })
    .catch(function(err) {
        return res.status(422).send({error: err.message});
    });
});
module.exports = router;