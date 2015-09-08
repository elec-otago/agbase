var orm = require('../orm');
var Sequelize = orm.Seq;

function NoResultError() {}
NoResultError.prototype = Object.create(Error.prototype, {name: {value: "NoResultError", enumerable: true}});

function AlreadyExistsError() {}
AlreadyExistsError.prototype = Object.create(Error.prototype, {name: {value: "AlreadyExistsError", enumerable: true}});

function AuthorizationError() {}
AlreadyExistsError.prototype = Object.create(Error.prototype, {name: {value: "AuthorizationError", enumerable: true}});



module.exports = {
    ValidationError:                    Sequelize.ValidationError,
    UniqueConstraintError:              Sequelize.UniqueConstraintError,
    ForeignKeyConstraintError:          Sequelize.ForeignKeyConstraintError,
    NoResultError:                      NoResultError,
    AuthorizationError:                 AuthorizationError,
    Error:                              Error
};