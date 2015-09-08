/*
 * Manages JWT Tokens for api and web app authentication
 */
var redisClient = require('./redisDB').redisClient;
var tokenGenerator = require('jsonwebtoken');
var secret = require('./config/secret');
var jwt = require('express-jwt');

var TOKEN_EXPIRATION = 600;
var TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

// Middleware for token verification
exports.verifyToken = function (req, res, next) {

    var jwtVerifier = jwt({secret: secret.secretToken});

    jwtVerifier(req, res, function(err) {
       if (err) {
           console.log('jwt err: ' + err);
           next(err);
       } else {
           var token = getToken(req.headers);
           next();

           /*redisClient.get(token, function (err, reply) {
               if (err) {
                   console.log(err);
                   return res.sendStatus(500);
               }

               if (reply) {
                   res.sendStatus(401);
               }
               else {
                   next();
               }

           });*/
       }
    });
};

exports.expireToken = function(headers) {
    var token = getToken(headers);

    return; //MDB not dealing with redis at the moment

    if (token !== null) {
        redisClient.set(token, { is_expired: true });
        redisClient.expire(token, TOKEN_EXPIRATION_SEC);
    }
};

var signToken = function(user, encodedGlobalRole, encodedFarmPermissions){
    var userToSign = {email: user.email, id: user.id, firstName: user.firstName,
        lastName: user.lastName, role:encodedGlobalRole, permissions:encodedFarmPermissions};

    return tokenGenerator.sign(userToSign, secret.secretToken, {expiresInMinutes: TOKEN_EXPIRATION});

};

exports.generateToken = function(user, role, farmPermissions) {
    /* IMPORTANT!
     Tokens are completely transparent and users can view everything we
     store inside. The security comes when we use a secret to generate the
     token's signature.
     Don't put anything that you don't want a user to see inside the token.
     */

    var FarmPermissionController = require('./db/controllers/FarmPermissionController');
    var GlobalRoleController = require('./db/controllers/GlobalRoleController');

    // We encode to reduce the token size (reduces it by about 75% minimum, should be more for users with many roles)
    var encodedGlobalRole = GlobalRoleController.encodeGlobalRole(role);
    var encodedFarmPermissions = FarmPermissionController.encodeFarmPermissions(farmPermissions);

    var userToSign = {email: user.email, id: user.id, firstName: user.firstName,
        lastName: user.lastName};

    return signToken(userToSign, encodedGlobalRole, encodedFarmPermissions);
};

exports.renewToken = function(user){

    // Encode if necessary
    if (typeof user.role !== 'string') {
        console.log('cannot renew expanded token');
        return null;
    }

    return signToken(user, user.role, user.permissions);
};

/*  Expands a token into a usable json object. The main thing we do
    is decode the global role and farm permissions.
 */
exports.expandToken = function(tokenUser) {
    var FarmPermissionController = require('./db/controllers/FarmPermissionController');
    var GlobalRoleController = require('./db/controllers/GlobalRoleController');

    try {
        tokenUser.role = GlobalRoleController.decodeGlobalRole(tokenUser.role);
        tokenUser.permissions = FarmPermissionController.decodeFarmPermissions(tokenUser.permissions);
        return tokenUser;
    } catch (err) {
        return null;
    }
};

var getToken = function(headers) {
    if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');

        if (part.length === 2) {
            var token = part[1];

            return part[1];
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};

exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;