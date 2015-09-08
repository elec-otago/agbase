/**
 * API for algorithms
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
var defined = require('../../utils/defined');
var helpers = agquire('ag/routes/utils/helpers');
var responder = agquire('ag/routes/utils/responder');

var AlgorithmController = agquire('ag/db/controllers/AlgorithmController');

/**
 * Get Algorithms.
 */

/**
 * @api {get} /algorithms/ Get Algorithms
 * @apiName GetAlgorithms
 * @apiGroup Algorithms
 *
 * @apiParam {String} [name] name of an algorithm to look for
 * @apiParam {Number} [category] Id of a Measurement Category to filter by.
 * @apiParam {Number} [limit] Number of results to limit the query
 * @apiParam {Number} [offset] Offset from start of query result
 * @apiParam {String} [include] list of objects to include in response ([category])
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
 *          "algorithms":
 *          [
 *               {
 *                   "id": 1,
 *                   "name": "Demo Algorithm",
 *                   "CategoryId": 1,
 *                   "createdAt": "2015-04-19",
 *                   "updatedAt": "2015-04-19"
 *               }
 *          ]
 *      }
 */
router.get('/',  function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        entities: ['measurementCategory'],
        includes: [{measurementCategory: ['category', 'measurementCategory']}],
        other: ['name', 'offset', 'limit']
    });

    var query = {};

    query.include = userQuery.includeList;

    query.where = {};

    helpers.setIfExists("categoryId", query.where, userQuery);
    helpers.setIfExists("name", query.where, userQuery);

    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    var access = {};
    access.requiredPermissions = [permissions.kViewGlobalAlgorithms];

    if (userQuery.include.category) {
        access.requiredPermissions.push(permissions.kViewGlobalCategories);
    }

    responder.authAndRespond(req, res, access, function() {
        return {
            algorithms: AlgorithmController.getAlgorithms(query)
        };
    });
});

/* POST create a single algorithm */
router.post('/', function(req, res) {

    helpers.validateRequestBody(req, res, {
        name: helpers.isValidString,
        measurementCategoryId: helpers.isValidId
    }, function(params) {

        var access = {};
        // Adding an algorithm to a category modifies the relationship, so I guess
        // you could argue for permission on both algorithms/categories. But algorithms
        // is probably fine for now
        access.requiredPermissions = [permissions.kEditGlobalAlgorithms];

        responder.authAndRespond(req, res, access, function() {
            return {
                algorithm: AlgorithmController.createAlgorithm(params.measurementCategoryId, params.name)
            };
        });
    });
});


router.get('/:algorithm_id', function(req, res) {

    var access = {};
    access.requiredPermissions = [permissions.kViewGlobalAlgorithms];

    responder.authAndRespond(req, res, access, function() {
        return {
            algorithm: AlgorithmController.getAlgorithm(req.params.algorithm_id)
        };
    });
});


router.put('/:algorithm_id', function(req, res) {

    helpers.validateRequestBody(req, res, {
        at_least_one: true,
        name: helpers.optional(helpers.isValidString),
        measurementCategoryId: helpers.optional(helpers.isValidId)
    }, function(params) {

        var access = {};
        access.requiredPermissions = [permissions.kEditGlobalAlgorithms];

        responder.authAndRespond(req, res, access, function() {
           return {
               algorithm: AlgorithmController.updateAlgorithm(req.params.algorithm_id, params)
           };
        });
    });
});


router.delete('/:algorithm_id', function(req, res) {

    var access = {};
    access.requiredPermissions = [permissions.kEditGlobalAlgorithms];

    responder.authAndRespond(req, res, access, function() {
        return {
            promise: AlgorithmController.removeAlgorithm(req.params.algorithm_id)
        };
    });
});


module.exports = router;
