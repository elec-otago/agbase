/**
 * API for authorization
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

var jwt = require('express-jwt');
var secret = require('../../config/secret');
var tokenManager = require('../../tokenManager');
var responder = agquire('ag/routes/utils/responder');
var RequestValidator = require('../utils/requestValidator');
var validator = RequestValidator.validator;
var UserManager = agquire('ag/utils/UserManager');
var UserController = agquire('ag/db/controllers/UserController');

/*
 Route	                HTTP Verb	Description
 =====================================================
 /api/auth/	            GET	        Get the authenticated user.
 /api/auth/	            POST	    Authenticate a user.
 /api/auth/         	DELETE	    De-authenticate the user.
 */


/*
 * Authenticate a user and get a token
 * Method: POST
 * Content-type: application/JSON
 * params: {email:, password:}
 * response: {user: {id: <userID>, email: <email address>, firstname: <firstname>, lastName: <lastname>}, token: <token}
 */
/**
 * @api {post} /auth/ Authenticate a user
 * @apiName AuthenticateUser
 * @apiGroup Authentication
 *
 * @apiParam {String} email  User email address
 * @apiParam {String} password     User password.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "test_user@company.com",
 *       "password": "mysecretpass"
 *     }
 * 
 * @apiSuccess {String} token Authentication token
 * 
 * @apiSuccess {Object} user User information.
 * @apiSuccess {String} user.id User id.
 * @apiSuccess {String} user.email  Email of the User.
 * @apiSuccess {String} user.firstName  Firstname of the User.
 * @apiSuccess {String} user.lastName  Lastname of the User.
 * @apiSuccess {String} user.role  User Role
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      user: {
 *              id: user.id,
 *              email: user.email,
 *              firstName: user.firstName,
 *              lastName: user.lastName,
 *              role: user.role
 *            },
 *      token: <token>
 *    }
 *
 */
router.post('/', function(req, res) {

    var email =  req.body.email;
    var password = req.body.password;

    if(! email || ! password) {
        return responder.rejectWithUserError(res, 'Both email and password are required');
    }

    UserController.authUser(email, password).then(function(user) {
        var token = tokenManager.generateToken(user, user.role, user.permissions);

        // remember: token's aren't opaque.
        var userToSend = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };

        res.json({user: userToSend, token: token});
    }).catch(function(err) {
        console.log(err.stack);
        res.status(401).json({error: 'Could not authenticate user!'});
    });
});

/**
 * @api {post} /auth/signup Signup
 * @apiName Signup
 * @apiGroup Authentication
 *
 * @apiDescription Create a new account with the provided details.
 *
 * @apiParam {String} token                     Invite token you received
 * @apiParam {String} firstName                 User's first name
 * @apiParam {String} lastName                  User's last name (surname)
 * @apiParam {String} email                     User's email address
 * @apiParam {String} password                  User's password

 * @apiParamExample {json} Example:
 *     {
 *       "token": "invite_token_i_got_via_email",
 *       "firstName": "First",
 *       "lastName" : "Last",
 *       "email" : "hello@test.com",
 *       "password": "this is probably a good password",
 *     }
 */
router.post('/signup', function(req, res) {

    RequestValidator.validate(req.body, res, {
        token: RequestValidator.isValidBundle,
        email: validator.isEmail,
        password: RequestValidator.notEmptyString,
        firstName: validator.isAscii,
        lastName: validator.isAscii
    }, function(params) {

        responder.respond(res, {
            promise: UserManager.createUser({
                bundle: params.token,
                email: params.email,
                password: params.password,
                firstName: params.firstName,
                lastName: params.lastName
            })
        });
    });
});

/**
 * @api {post} /auth/reset Password reset
 * @apiName PasswordResetRequest
 * @apiGroup Authentication
 *
 * @apiDescription Request a password reset via email.
 *
 * @apiParam {String} email                         Email address that's associated with your account
 * @apiParam {Object} urlDescriptor                 Describes the url that is sent in the email
 * @apiParam {String} urlDescriptor.base            Base url that the user can use to enter a new password
 * @apiParam {String} urlDescriptor.param           GET parameter used to pass in the token
 *
 * @apiParamExample {json} Example:
 * {
 *      "email": "user@forgetful.com",
 *      "urlDescriptor": {
 *          "base": "https://localhost:8443",
 *          "param": "token"
 *      }
 * }
 */
router.post('/reset', function(req, res) {

    RequestValidator.validate(req.body, res, {
        email: validator.isEmail,
        urlDescriptor: RequestValidator.isValidUrlDescriptor
    }, function(params) {

        responder.respond(res, {
            promise: UserManager.requestPasswordReset(params.email, params.urlDescriptor)
        });
    });
});

/**
 * @api {post} /auth/reset/do   Finalize password reset
 * @apiName PasswordResetFinish
 * @apiGroup Authentication
 *
 * @apiDescription Finish the password reset request
 *
 * @apiParam {String} token                         Verification token received via email
 * @apiParam {Object} password                      New password
 *
 * @apiParamExample {json} Example:
 * {
 *      "token": "secret token received via email",
 *      "password": "I won't forget this"
 * }
 */
router.post('/reset/do', function(req, res) {

    RequestValidator.validate(req.body, res, {
        token: RequestValidator.isValidBundle,
        password: RequestValidator.notEmptyString
    }, function(params) {

        responder.respond(res, {
            promise: UserManager.finishPasswordReset({
                bundle: params.token,
                password: params.password
            })
        });
    });
});

/**
 * @api {get} /auth/:secret  Get authenticated user information
 * @apiName GetAuthenticatedUser
 * @apiGroup Authentication
 *
 * @apiDescription Get authenticated user details from the token provided by
 * the AuthenticateUser method.
 * 
 * @apiParam {String} secret  User authentication token
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "secret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVuaXR0Z"
 *     }
 * 
 * @apiSuccess {Object} user Authenticated User information.
 * @apiSuccess {String} user.id User id.
 * @apiSuccess {String} user.email  Email of the User.
 * @apiSuccess {String} user.firstName  Firstname of the User.
 * @apiSuccess {String} user.lastName  Lastname of the User.
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      user: {
 *              id: user.id,
 *              email: user.email,
 *              firstName: user.firstName,
 *              lastName: user.lastName
 *            }
 *    }
 *
 */
/*
* returns authenticated user
 */
router.get('/', jwt({secret: secret.secretToken}), tokenManager.verifyToken , function(req, res) {

    if(! req.user){
        return res.sendStatus(401);
    }

    var userToSend = {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
    };

    return res.json({user: userToSend});
});


/*
    Reauthenticate a token
 */
router.put('/', jwt({secret: secret.secretToken}), tokenManager.verifyToken , function(req, res) {

    if(! req.user){
        return res.sendStatus(401);
    }

    var token = tokenManager.renewToken(req.user);

    // expire old token
    tokenManager.expireToken(req.headers);

    delete req.user;

    return res.json({token: token});
});

/*
 * Deauthenticate a user token
 */
router.delete('/', jwt({secret: secret.secretToken}), function(req, res){

    if(req.user) {

        tokenManager.expireToken(req.headers);

        delete req.user;
        return res.sendStatus(200);
    }

    return res.sendStatus(401);
});


module.exports = router;