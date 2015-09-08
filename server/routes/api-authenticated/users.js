/**
 * API for users
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
var helpers = agquire('ag/routes/utils/helpers');
var defined = require('../../utils/defined');
var UserManager = agquire('ag/utils/UserManager');
var responder = agquire('ag/routes/utils/responder');
var permissions = require('../utils/permissions');

var UserController = agquire('ag/db/controllers/UserController');

// TODO rewrite file and add permissions
// TODO should remove GET on users and only allow querying or something
// TODO Also you shouldn't specify a globalRoleId when you register

/*
 Route	                HTTP Verb	Description
 =====================================================
 /api/users	            GET	        Get all the users.
 /api/users	            POST	    Create a user.
 /api/users/:user_id	GET	        Get a single user.
 /api/users/:user_id	PUT	        Update a user with new info.
 /api/users/:user_id	DELETE	    Delete a user.
 */



/**
 * @api {get} /users/ Get all Users
 * @apiName GetUsers
 * @apiGroup Users
 * 
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "users": [
 *          {
 *              "id": 1,
 *              "email": "demouser@agbase.elec.ac.nz",
 *              "firstName": "Demo",
 *              "lastName": "User",
 *              "GlobalRoleId": 1
 *          }]
 *      }
 */
router.get('/', function(req, res) {

    responder.respond(res, {
        users: UserController.getUsers()
    });
});


/*
 * POST create users
 */

/**
 * @api {post} /users/ Create a User
 * @apiName PostUser
 * @apiGroup Users
 *
 * @apiParam {String} email The email address of the user to create.
 * @apiParam {String} firstName The first name of the user to create.
 * @apiParam {String} lastName The last name of the usr to create.
 * @apiParam {Number} globalRoleId The id of the global role to give the user:
 * <br> 1 - Wizard role
 * <br> 2 - Admin role
 * <br> 3 - User role
 * @apiParam {String} password The login password for the new user.
 * 
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "message: "Created User!",
 *          "user": 
 *          {
 *              "id": 1
 *              "email": "demouser@agbase.elec.ac.nz"
 *              "firstName": "Demo"
 *              "lastName": "User",             
 *              "GlobalRoleId": 1
 *          }
 *      }
 *
 * @apiError EmptyRequestBody No data included in request body. 
 * @apiErrorExample EmptyRequestBody
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "EmptyRequestBody"
 *      }
 *
 * @apiError IncompleteRequest Request body is missing required fields.
 * @apiErrorExample IncompleteRequest
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "IncompleteRequest"
 *      }
 */
router.post('/' , function(req, res) {

   var userToCreate = req.body;

    if(! userToCreate){
       return res.status(422).send( {error: "EmptyRequestBody"});
    }

    var access = {};
        access.requiredPermissions = [permissions.kEditGlobalUsers];

        responder.authAndRespond(req, res, access, function() {
            return {
                user: UserController.createSingleUser(userToCreate)
            };
        });
});

/**
 * @api {post} /users/invite/ Invite a user to join the system
 * @apiName InviteUser
 * @apiGroup Users
 *
 * @apiParam {String} email                     User's email address
 * @apiParam {Object} urlDescriptor             Describes URL used for accepting the invite
 * @apiParam {String} urlDescriptor.base        URL for verification (sent in the email)
 * @apiParam {String} urlDescriptor.param       GET parameter used to pass in the verification token
 */
router.post('/invite' , function(req, res) {

    var RequestValidator = require('../utils/requestValidator');
    var validator = RequestValidator.validator;

    RequestValidator.validate(req.body, res, {
        email: validator.isEmail,
        urlDescriptor: {
            base: validator.isURL,
            param: RequestValidator.notEmptyString
        }
    }, function(params) {

        var access = {};
        responder.authAndRespond(req, res, access, function() {
            return {
                promise: UserManager.inviteUser(params.email, params.urlDescriptor)
            };
        });
    });
});

/**
 * @api {get} /users/:user_id  Get User
 * @apiName GetUser
 * @apiGroup Users
 * 
 * @apiParam {Number} user_id The user id of the user to get.
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "user":
 *          {
 *              "id": 1,
 *              "email": "demouser@agbase.elec.ac.nz",
 *              "firstName": "Demo",
 *              "lastName": "User",
 *              "GlobalRoleId": 1
 *          }
 *      }
 *
 * @apiError UserNotFound User doesn't exist.
 * @apiErrorExample UserNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "UserNotFound"
 *      }
 */
router.get('/:user_id', function(req, res) {

    responder.respond(res, {
        user: UserController.getUser(req.params.user_id)
    });
});


/**
 * @api {put} /users/:user_id Update a User
 * @apiName PutUser
 * @apiGroup Users
 *
 * @apiParam {Number} user_id The user id of the user to update.
 * @apiParam {String} [email] The updated user's email address.
 * @apiParam {String} [firstName] The updated user's first name.
 * @apiParam {String} [lastName] The updated user's last name.
 * @apiParam {String} [password] The updated user's password.
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Updated User!",
 *          "user":
 *          {
 *              "id": 1,
 *              "email": "demouser@agbase.elec.ac.nz",
 *              "firstName": "Demo",
 *              "lastName": "User",
 *              "GlobalRoleId": 1
 *          }
 *      }
 *
 * @apiError UserNotFound User doesn't exist.
 * @apiErrorExample UserNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "UserNotFound"
 *      }
 */
router.put('/:user_id', function(req, res) {

    // email, firstName, lastName, password
    var userDetails = req.body;

    var access = {};
    access.requiredPermissions = [permissions.kEditGlobalUsers];

    responder.authAndRespond(req, res, access, function() {
        return {
            user: UserController.updateUser(req.params.user_id, userDetails)
        };
    });
});


/**
 * @api {delete} /users/:user_id Delete a User
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiParam {Number} user_id The user id of the user to delete.
 *
 * @apiSuccessExample Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Removed User!"
 *      }
 *
 * @apiError UserNotFound User doesn't exist.
 * @apiErrorExample UserNotFound
 *      HTTP/1.1 422 Unprocessable Entity
 *      {
 *          "error": "UserNotFound"
 *      }
 */
router.delete('/:user_id', function(req, res) {


    var access = {};
    access.requiredPermissions = [permissions.kEditGlobalUsers];

    responder.authAndRespond(req, res, access, function() {
        return {
            user: UserController.removeSingleUser(req.params.user_id)
        };
    });

});


module.exports = router;
