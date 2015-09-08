/**
 * API for global roles
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
var GlobalRoleController = agquire('ag/db/controllers/GlobalRoleController');

/*
 Route	                HTTP Verb	Description
 =====================================================
 /api/global-roles	            GET	        Get all the roles.
 */

router.get('/', function(req, res) {

    var access = {};
    access.requiredPermissions = [permissions.kViewGlobalRoles];

    responder.authAndRespond(req, res, access, function() {
        return {
            roles: GlobalRoleController.getGlobalRoles()
        };
    });
});


module.exports = router;
