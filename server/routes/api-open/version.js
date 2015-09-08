/**
 * API for version information
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
var version = require('../../package.json').version;
var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

/**
 * @api {get} /version Request System version information
 * @apiName GetVersion
 * @apiGroup Version
 *
 *
 * @apiSuccess {String} server Name of the server.
 * @apiSuccess {String} version  Version of the server.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "server": "AgBase",
 *       "version": "0.0.1"
 *     }
 *
 */
router.get('/',  function(req, res) {

    var params = req.query;

    var dbType = (mongoose.connection.name === "dbPasture")? "production": "test";
    
    console.log(dbType);
    
    console.log('called version route');

    return res.json(
        {   server:'AgBase',
            version: version,
            spatial_db: dbType
    });
});

module.exports = router;
