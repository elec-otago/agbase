var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var challenge = agquire('ag/utils/challenge');
var UserController = agquire('ag/db/controllers/UserController');
var DatabaseErrors = agquire('ag/db/controllers/Errors');

exports.createInvite = function(email) {
    email = email.toLowerCase();

    // We only want to continue if there is an error
    // i.e. no user exists.
    return UserController.getUser({where: {email: email}}).then(function() {
        throw new DatabaseErrors.ValidationError('user exists');
    }).catch(DatabaseErrors.NoResultError, function() {
        return helpers.createOne(orm.model("SystemInvitation"), {
            email: email,
            token: challenge.create()
        });
    });
};

exports.consumeInvitation = function(details) {

    var token = details.token,
        email = details.email;

    return helpers.removeOne(orm.model("SystemInvitation"), {
        where: {token: token, email: email}
    });
};