/**
 * Created by mark on 22/05/14.
 */
var orm = require('../orm');
var Seq = orm.Seq;

var nameValidator = {
    notEmpty: {msg: "Empty name"},
    isAlpha: {msg: "Invalid name"}
};

module.exports = {

    model:{
        id: { type: Seq.INTEGER, primaryKey: true, autoIncrement: true },
        email: {type: Seq.STRING, allowNull: false, unique: true,
            validate: {
                isEmail: {msg: "Invalid email"},
                notEmpty: {msg: "Empty email"}
            }
        },
        firstName: {type: Seq.STRING, allowNull: false, validate: nameValidator},
        lastName: {type: Seq.STRING, allowNull: false, validate: nameValidator},
        hash: {type: Seq.STRING, allowNull: false, validate: {notEmpty: {msg: "Empty password"}}}
    },

    relations:{
        Measurement: {type: 'hasMany', opt: {as: 'measurements', onDelete: 'set null', foreignKey: 'userId'}},
        FarmPermission: {type: 'hasMany', opt: {as: 'permissions', onDelete: 'cascade', foreignKey: 'userId'}},
        GlobalRole: {type: 'belongsTo', opt: {as: 'globalRole', onDelete: 'cascade'}},
        UsageTier: {type: 'belongsTo', opt: {as: 'usageTier', onDelete: 'cascade'}}
    },

    options:{
        freezeTableName: true
    }
};