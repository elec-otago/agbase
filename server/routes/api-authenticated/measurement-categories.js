/**
 * API for measurement-categories
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
var CategoryController = agquire('ag/db/controllers/MeasurementCategoryController');
var helpers = agquire('ag/routes/utils/helpers');
var defined = require('../../utils/defined');
var responder = agquire('ag/routes/utils/responder');

/**
 * Get Categories.
 */

/**
 * @api {get} /measurement-categories/ Get Measurement Categories
 * @apiName GetMeasurementCategories
 * @apiGroup Measurement Categories
 *
 * @apiParam {String} [name] name of a Measurement Category to look for
 * @apiParam {Boolean} [isSpatial] filter for spatial data categories or standard data categories
 * @apiParam {Number} [limit] Number of results to limit the query
 * @apiParam {Number} [offset] Offset from start of query result
 * @apiParam {String} [include] list of objects to include in response ([algorithms])
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
 *          "categories":
 *          [
 *               {
 *                   "id": 1,
 *                   "name": "Demo Category",
 *                   "isSpatial": false,
 *                   "createdAt": "2015-04-19",
 *                   "updatedAt": "2015-04-19"
 *               }
 *          ]
 *      }
 */
router.get('/', function(req, res) {

    var userQuery = helpers.parseQuery(req.query, {
        entities: [],
        includes: ['algorithms'],
        other: ['name', 'offset', 'limit', 'isSpatial']
    });

    var query = {};

    query.include = userQuery.includeList;

    query.where = {};

    helpers.setIfExists("name", query.where, userQuery);
    if (defined(userQuery.params.isSpatial)) {
        query.where.isSpatial = userQuery.params.isSpatial === 'true';
    }

    helpers.setIfExists("offset", query, userQuery);
    helpers.setIfExists("limit", query, userQuery);

    var access = {};
    access.requiredPermissions = [permissions.kViewGlobalCategories];

    if (userQuery.include.algorithms) {
        access.requiredPermissions.push(permissions.kViewGlobalAlgorithms);
    }

    responder.authAndRespond(req, res, access, function() {
        return {
            categories: CategoryController.getMeasurementCategories(query)
        };
    });
});


/**
 * @api {post} /measurement-categories/ Create a Measurement Category
 * @apiName CreateAMeasurementCategory
 * @apiGroup Measurement Categories
 *
 * @apiParam {String} [name] Name of the new Measurement Category.
 * @apiParam {Boolean} [isSpatial] should be true if this is a spatial data category.
 *
 * @apiSuccess {Object[]} category Newly created measurement category object.
 * @apiSuccess {String} message Result message - "Created" if a new category was created or "Existed" if a category existed with the same name.
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
        name: helpers.isValidString,
        isSpatial: helpers.optional(helpers.isBoolean)
    }, function(params) {
        if (!defined(params.isSpatial)) {
            params.isSpatial = false;
        }

        var access = {};
        access.requiredPermissions = [permissions.kEditGlobalCategories];

        responder.authAndRespond(req, res, access, function() {
            return {
                category: CategoryController.createMeasurementCategory(params.name, params.isSpatial)
            };
        });
    });
});


router.get('/:cat_id', function(req, res) {

    var access = {};
    access.requiredPermissions = [permissions.kViewGlobalCategories];

    responder.authAndRespond(req, res, access, function() {
        return {
            category: CategoryController.getMeasurementCategories(req.params.cat_id)
        };
    });
});


router.put('/:cat_id', function(req, res) {
    'use strict';

    helpers.validateRequestBody(req, res, {
        name: helpers.isValidString
    }, function(params) {
        var access = {};
        access.requiredPermissions = [permissions.kEditGlobalCategories];

        responder.authAndRespond(req, res, access, function() {
            return {
                category: CategoryController.updateMeasurementCategory(req.params.cat_id, {name: params.name})
            };
        });
    });
});


router.delete('/:cat_id', function(req, res) {

    var access = {};
    // Deleting a measurement category also causes all the measurements to
    // be deleted. So they need permission to modify measurements, too.
    // This is probably a good idea because it means people can create categories
    // but not remove them (and thus heaps of measurements).
    // Note: we don't specify a farm because this is a global action.. Permission
    // on a single farm is not enough.
    access.requiredPermissions = [permissions.kEditGlobalCategories, permissions.kEditFarmMeasurements];

    responder.authAndRespond(req, res, access, function() {
        return {
            promise: CategoryController.removeMeasurementCategory(req.params.cat_id)
        };
    });
});


module.exports = router;
