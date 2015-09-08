var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model:{
        id: { type: Seq.BIGINT, primaryKey: true, autoIncrement: true },
        userId: {
            type: Seq.INTEGER,
            unique: 'uniqueInFarm',
            allowNull: false,
            references: {model: "User", key: "id"},
            onDelete:"cascade"
        }, //defining foreign key here to get constraint
        farmId: {
            type: Seq.INTEGER,
            unique: 'uniqueInFarm',
            allowNull: false,
            references: {model: "Farm", key: "id"},
            onDelete:"cascade"
        }, //defining foreign key here to get constraint
        farmRoleId: {
            type: Seq.INTEGER,
            allowNull: false,
            references: {model: "FarmRole", key: "id"},
            onDelete:"cascade"
        } //defining foreign key here to get constraint
    },

    relations:{
        User: {type: 'belongsTo', opt: {as: 'user', onDelete: 'cascade'}},
        Farm: {type: 'belongsTo', opt: {as: 'farm', onDelete: 'cascade'}},
        FarmRole: {type: 'belongsTo', opt: {as: 'farmRole', onDelete: 'cascade'}}
    },

    options:{
        freezeTableName: true
    }
};