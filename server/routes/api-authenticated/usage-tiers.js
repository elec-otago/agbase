/**
 * API for usage tiers
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
var responder = agquire('ag/routes/utils/responder');
var UsageTierController = agquire('ag/db/controllers/UsageTierController');


/**
 * @api {get} /usage-tiers Get all API usage tiers
 * @apiName GetUsageTiers
 * @apiGroup UsageTiers
 *
 * @apiSuccess {List} tiers array of usage tiers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "tiers" : [ {
 *            "id" : 1,
 *          "name" : "standard",
 * "dailyRequests" : "1000"
 *       }];
 *     }
 *
 */
router.get('/', function(req, res) {

    var access = {};
    access.requiredPermissions = [permissions.kViewGlobalRoles]; //TODO: probably need a permission for usage tiers, only admin should see them ?

    responder.authAndRespond(req, res, access, function() {
        return {
            tiers: UsageTierController.getUsageTiers()
        };
    });
});


module.exports = router;
