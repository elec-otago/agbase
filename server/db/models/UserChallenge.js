var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model: {
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        token: {type: Seq.STRING, unique: true, allowNull: false, validate: {
            notEmpty: true
        }},
        type: {type: Seq.INTEGER, allowNull: false},
        userId: {type: Seq.INTEGER, allowNull: false, references: {model: 'User', key: 'id'}}
    },

    relations: {
        User: {type: 'belongsTo', opt: {as: 'user', onDelete: 'cascade'}}
    },

    options: {
        freezeTableName: true
    }
};