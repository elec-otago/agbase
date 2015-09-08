var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model: {
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        token: {
            type: Seq.STRING,
            unique: 'inFarm',
            allowNull: false
        },
        email: {type: Seq.STRING, allowNull: false, unique: false,
            validate: {
                isEmail: {msg: "Invalid email"},
                notEmpty: {msg: "Empty email"}
            }
        },
        farmId: {
            type: Seq.INTEGER,
            unique: 'inFarm',
            allowNull: false,
            references: {model: "Farm", key: "id"},
            onDelete:"cascade"
        }, //defining foreign key here to get constraint
        farmRoleId: {
            type: Seq.INTEGER,
            allowNull: true,
            references: {model: "FarmRole", key: "id"},
            onDelete:"cascade"
        } //defining foreign key here to get constraint
    },

    relations: {
        Farm: {type: 'belongsTo', opt: {as: 'farm', onDelete: 'cascade'}},
        FarmRole: {type: 'belongsTo', opt: {as: 'farmRole', onDelete: 'cascade'}}
    },

    options: {
        freezeTableName: true
    }
};