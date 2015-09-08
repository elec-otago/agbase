var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model: {
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        email: {
            type: Seq.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        token: {
            type: Seq.STRING,
            // only the (email, token) combo strictly needs to be unique
            // but we're using guids so this is fine
            unique: true,
            allowNull: false

        }
    },

    options: {
        freezeTableName: true
    }
};