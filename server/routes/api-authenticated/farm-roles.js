/**
 * API for farm-roles
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
var responder = agquire('ag/routes/utils/responder');

var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');

/*
 Route	                HTTP Verb	Description
 =====================================================
/roles	            GET	        Get all the roles.
 */
/**
 * @api {get} /roles  Get Farm Roles
 * @apiName getFarmRoles
 * @apiGroup farm-roles
 *
 * @apiDescription Get all the farm roles
 * 
 * 
 * 
 * @apiSuccess {Number} apiCallCount API call count.
 * @apiSuccess {Array} roles Farm Role Information.
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
    "apiCallCount": 45,
    "roles": [
        {
            "editFarmAnimals": false,
            "editFarmHerds": false,
            "editFarmMeasurements": false,
            "editFarmPermissions": false,
            "id": 1,
            "name": "Viewer",
            "viewFarmAnimals": true,
            "viewFarmHerds": true,
            "viewFarmMeasurements": true,
            "viewFarmPermissions": true
        },
        {
            "editFarmAnimals": true,
            "editFarmHerds": true,
            "editFarmMeasurements": true,
            "editFarmPermissions": true,
            "id": 2,
            "name": "Manager",
            "viewFarmAnimals": true,
            "viewFarmHerds": true,
            "viewFarmMeasurements": true,
            "viewFarmPermissions": true
        }
    ]
}
 *
 */
router.get('/', function(req, res) {

    responder.respond(res, {
        roles: FarmRoleController.getFarmRoles()
    });
});


module.exports = router;
