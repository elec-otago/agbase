/**
 * Restful API for Agritech Analytics
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * We use a token for authentication, no other client state is stored.
 */
var express = require('express');
var router = express.Router();

var tokenManager = require('../tokenManager');
var accountManager = require('../accountManager');
var authorizer = require('./utils/authorizer');

var filesystem = require('fs');
var responseChecker = require('../responseChecker');
var appConfig = require('../appConfig');

var openRoutesPath = "routes/api-open/";
var closedRoutesPath = "routes/api-authenticated/";

var openRoutes = [];
var closedRoutes = [];

/*
 * adds routes to the router.
 */
function addRoutes(path, output, rootRouteName){

    filesystem.readdirSync(path).forEach(function(name) {

        if(name.indexOf(".js") === -1){

            var subroutes = [];
            var subRoute = name + "/";

            addRoutes(path + subRoute, subroutes, rootRouteName + subRoute);

            output[subRoute] = subroutes;

            return;
        }

        var routeName = name.replace(/\.js$/i, "");

        var object = agquire("ag/" + path+ name);

        output[routeName] = object;

        router.use(rootRouteName + routeName, object);

        console.log("added route for " + rootRouteName + routeName);
    });
}

console.log("Setting up API");

//unathenticated routes from file structure
console.log("Setting up open routes");
addRoutes(openRoutesPath,openRoutes, "/");


//all other API routes require authentication middleware
router.use('*', tokenManager.verifyToken);


/**
 * @apiDefine RequestUserNotFoundError
 *
 * @apiError RequestUserNotFound The user that performed the request could not be found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "RequestUserNotFound"
 *     }
 */


/**
 * @apiDefine ServerError
 *
 * @apiError ServerError An unknown server error occurred. Please submit a but report to the developers.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Error
 *     {}
 */

/**
 * @apiDefine AuthorisationError
 *
 * @apiError AuthorisationError The user that performed the request was no authorised to access the resource
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "AuthorisationError",
 *       "message" : "You do not have permission to view this farm!"
 *     }
 */

//middleware for verifying authorization
router.use('*', function(req, res, next){
    req.user = tokenManager.expandToken(req.user);

    if(! req.user){
        return res.status(404).send( {error: "RequestUserNotFound"});
    }

    // This function is called to ensure the user has
    // the necessary permissions. authorizedCallback is only
    // called when they have permission. If they don't have permission,
    // the reject is rejected with a reason.
    // Note: this executes synchronously and returns true if the user
    // has access, false otherwise.

    /**
     * Ensures the user has the necessary permissions to execute
     * the desired action. If the user doesn't, then (by default)
     * an exception is thrown. This will break the current promise chain.
     * If there is no promise chain to break, or you don't want to use
     * exceptions, you can pass in a callback which is called when
     * authorization fails.
     *
     * @param access access to check
     * @param [errorCallback] called instead of throwing an error
     * @returns true or false indicating result
     */
    req.user.requiresAccess = function(access, errorCallback) {

        return authorizer.authenticate(req.user, access, function(why) {

            var Errors = agquire('ag/db/controllers/Errors');
            var error = Errors.AuthorizationError(why);

            if (errorCallback) {
                errorCallback(error);
            } else {
               throw error;
            }
        });
    };

    // This function is used when access is required on multiple farms
    // accessList should be a list of access objects.
    // This function executes synchronously and is only really used by PUT
    // routes. We need to pass a return value to the controller code, so we
    // omit the authorized callback here.
    req.user.requiresMultipleAccess = function(accessList, errorCallback) {

        if (accessList === null) {
            return true;
        }

        var realErrorCallback = undefined;
        if (errorCallback) {
            realErrorCallback = function() {
                allowed = false;
                errorCallback();
            };
        }

        var allowed = true;
        for (var index = 0; index < accessList.length; index++) {
            // Unless an error callback is provided, we'll throw an exception
            req.user.requiresAccess(accessList[index++], realErrorCallback);

            if (!allowed) {
                break;
            }
        }

        return allowed;
    };

    next();
});

//middleware for verifying user accounting/api usage

router.use('*', accountManager.checkUsage);

router.use('*', accountManager.usageAppender); //append usage count to every api response

router.use('*', responseChecker.addSupervisor(appConfig.kMaxQueryLength)); //adds a final check to make sure the response isn't too big

//authenticated routes
console.log("Setting up authenticated routes");
addRoutes(closedRoutesPath,closedRoutes, "/");

module.exports = router;