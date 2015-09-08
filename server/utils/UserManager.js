var Bundle = agquire('ag/utils/urlSafeBundle');
var SystemInvitationController = agquire('ag/db/controllers/SystemInvitationController');
var UserController = agquire('ag/db/controllers/UserController');
var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');
var DatabaseErrors = agquire('ag/db/controllers/Errors');
var Transaction = agquire('ag/db/controllers/Transaction');
var mailer = agquire('ag/utils/mailer/mailer');
var Promise = agquire('ag/wowPromise');
var Challenge = agquire('ag/utils/challenge');
var defined = agquire('ag/utils/defined');
var tokenManager = agquire('ag/tokenManager');

var CHALLENGE_ID_PASSWORD_RESET                         = 1;

var createUser = function(details) {

    var email = details.email,
        bundle = details.bundle,
        password = details.password,
        firstName = details.firstName,
        lastName = details.lastName;

    var decoder = new Bundle.Decoder(bundle);
    var token = decoder.dataForKey(Bundle.CHALLENGE_TOKEN_ID);
    if (token === null) {
        return Promise.reject('challenge');
    }

    return Transaction.begin(function(t) {

        return SystemInvitationController.consumeInvitation({
            token: token,
            email: email
        }).bind({}).then(function() {
            return UserController.createSingleUser({
                globalRoleId: null, // use default
                password: password,
                email: email,
                firstName: firstName,
                lastName: lastName
            });
        });
    });
};

var inviteByEmail = function(email, urlDescriptor) {
    return Transaction.begin(function (t) {
        return SystemInvitationController.createInvite(email).then(function(invite) {
            var encoder = new Bundle.Encoder(Bundle.CHALLENGE_TOKEN_ID, invite.token);
            var bundle = encoder.getData();

            mailer.sendTemplate(email, 'system-invite-template', {
                responseUrl: Challenge.buildUrl(urlDescriptor, bundle)
            });
        });
    });
};

var requestPasswordReset = function(email, urlDescriptor) {

    return Transaction.begin(function(t) {
        return UserController.getUserByEmail(email).bind({}).then(function(user) {
            this.user = user;

            return UserController.createChallenge({
                userId: user.id,
                type: CHALLENGE_ID_PASSWORD_RESET
            });
        }).then(function(challenge) {
            var encoder = new Bundle.Encoder(Bundle.CHALLENGE_TOKEN_ID, challenge.token);
            encoder.append(Bundle.USER_ID, this.user.id);

            var bundle = encoder.getData();

            mailer.sendTemplate(email, 'user-password-reset-template', {
                responseUrl: Challenge.buildUrl(urlDescriptor, bundle)
            });
        });
    });
};

var finishPasswordReset = function(details) {

    var bundle = details.bundle,
        password = details.password;

    var decoder = new Bundle.Decoder(bundle);
    var token = decoder.dataForKey(Bundle.CHALLENGE_TOKEN_ID);
    var userId = decoder.dataForKey(Bundle.USER_ID);

    if (token === null || userId === null) {
        return Promise.reject('bad bundle');
    }

    return Transaction.begin(function(t) {

        return UserController.verifyChallenge({
            userId: userId,
            token: token,
            type: CHALLENGE_ID_PASSWORD_RESET
        }).then(function() {

            return UserController.updateUser({where: {id: userId}}, {
                password: password
            });
        });
    });
};

var resolveUser = function(details) {
    if (defined(details.userId)) {
        return UserController.getUser({where: {id: details.userId}})
            .then(function(user) {
                return {userId: user.id, email: user.email};
            }).catch(DatabaseErrors.NoResultError, function() {
                throw new DatabaseErrors.NoResultError('user');
            });
    } else if (defined(details.email)) {
        return UserController.getUserByEmail(details.email)
            .then(function(user) {
                return {userId: user.id, email: user.email};
            }).catch(DatabaseErrors.NoResultError, function() {
                return {email: details.email};
            });
    }
};

var inviteToFarm = function(details) {
    var invitee = details.invitee,
        farmId = details.farmId,
        farmRoleId = details.farmRoleId,
        urlDescriptors = details.urlDescriptors;

    return Transaction.begin(function(t) {

        return resolveUser({
            userId: invitee.userId,
            email: invitee.email
        }).bind({}).then(function(user) {

            this.user = user;
            return FarmPermissionController.inviteUserToFarm({
                email: user.email,
                farmId: farmId,
                farmRoleId: farmRoleId
            });
        }).then(function(farmInvite) {

            var encoder = new Bundle.Encoder(Bundle.FARM_INVITE_CHALLENGE, farmInvite.token);
            encoder.append(Bundle.FARM_ID, farmId);

            if (!defined(this.user.userId)) {
                return SystemInvitationController.createInvite(this.user.email).then(function(invite) {
                    encoder.append(Bundle.CHALLENGE_TOKEN_ID, invite.token);
                    return {encoder: encoder, template: 'signup-farm-invite-template', urlDescriptor: urlDescriptors.signup};
                });
            } else {
                return {encoder: encoder, template: 'farm-invite-template', urlDescriptor: urlDescriptors.existing};
            }
        }).then(function(details) {

            var encoder = details.encoder,
                template = details.template,
                urlDescriptor = details.urlDescriptor;

            var bundle = encoder.getData();

            mailer.sendTemplate(this.user.email, template, {
                responseUrl: Challenge.buildUrl(urlDescriptor, bundle)
            });
        });
    });
};

var acceptInviteToFarm = function(details) {
    var bundle = details.bundle,
        userId = details.userId;

    var decoder = new Bundle.Decoder(bundle);
    var token = decoder.dataForKey(Bundle.FARM_INVITE_CHALLENGE);
    var farmId = decoder.dataForKey(Bundle.FARM_ID);

    if (token === null || farmId === null) {
        return Promise.reject('bad bundle');
    }

    return Transaction.begin(function(t) {
        return UserController.getUser({where: {id: userId}, include: ['permissions', 'globalRole', 'permissions.farmRole']}).then(function(user) {

            return FarmPermissionController.acceptInviteToFarm({
                token: token,
                farmId: farmId,
                email: user.email,
                userId: user.id
            }).then(function(permission) {

                // TODO make this better and invalidate previous tokens
                // TODO also give new token the same expiration time
                return UserController.authUserWithoutPassword(user).then(function(user) {
                    return tokenManager.generateToken(user, user.role, user.permissions);
                });
            });
        });
    });
};

module.exports = {

    inviteUser: inviteByEmail,
    createUser: createUser,
    requestPasswordReset: requestPasswordReset,
    finishPasswordReset: finishPasswordReset,

    inviteToFarm: inviteToFarm,
    acceptInviteToFarm: acceptInviteToFarm
};