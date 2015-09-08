/**
 * Created by mark on 22/05/14.
 */
var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model:{
        id: { type: Seq.INTEGER, primaryKey: true, autoIncrement: true },
        name: {type: Seq.STRING, unique: true, allowNull: false, validate: {
            notEmpty: {msg: "Empty role name"}
        }},
        editFarmPermissions: {type: Seq.BOOLEAN, allowNull: false}, //can add/remove/update users to farm
        viewFarmPermissions: {type: Seq.BOOLEAN, allowNull: false}, //can view what users have permission in the farm
        editFarmHerds: {type: Seq.BOOLEAN, allowNull: false}, //can add/remove herds in the farm
        viewFarmHerds: {type: Seq.BOOLEAN, allowNull: false}, //can view the herds in the farm
        editFarmAnimals: {type: Seq.BOOLEAN, allowNull: false}, //can add/remove animals in the farm
        viewFarmAnimals: {type: Seq.BOOLEAN, allowNull: false}, //can view the animals in the farm
        editFarmMeasurements: {type: Seq.BOOLEAN, allowNull: false}, //can add/remove measurements to animals in the farm
        viewFarmMeasurements: {type: Seq.BOOLEAN, allowNull: false}, //can view measurements on the animals in the farm
        inviteUsers: {type: Seq.BOOLEAN, allowNull: false, defaultValue: false}
    },

    relations:{
        FarmPermission: {type: 'hasMany', opt: {as: 'permissions', onDelete: 'cascade', foreignKey: 'farmRoleId'}}
    },

    options:{
        freezeTableName: true
    }
};