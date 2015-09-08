/**
 * Created by mark on 22/05/14.
 *
 * User permissions for system wide services
 */
var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model:{
        id: { type: Seq.INTEGER, primaryKey: true, autoIncrement: true },
        name: {type: Seq.STRING, unique: true,
            validate: {
                notEmpty:{msg: "Empty name"}
            }
        },
        // NOTE: if you add new properties, add them to the array in getPermissionNames, too.
        editAlgorithms: Seq.BOOLEAN, //can add/remove/update Algorithms
        viewAlgorithms: Seq.BOOLEAN, //can view measurement Algorithms
        editAnimals: Seq.BOOLEAN,   //can create/edit/remove Animals from anywhere
        viewAnimals: Seq.BOOLEAN,   //can view Animals from anywhere
        editFarms: Seq.BOOLEAN,     //can create/edit/remove farms
        viewFarms: Seq.BOOLEAN,     //can view other farms than ones the user is associated to
        editFarmRoles: Seq.BOOLEAN,     //can create/edit/remove farmRoles
        viewFarmRoles: Seq.BOOLEAN,     //can view all farm roles
        editGlobalRoles: Seq.BOOLEAN,   //can create/edit global roles
        viewGlobalRoles: Seq.BOOLEAN,   //can view all global roles
        editHerds: Seq.BOOLEAN,         //can create/edit/remove Herds from anywhere
        viewHerds: Seq.BOOLEAN,         //can view other Herds than ones in the farm the user is associated to
        editMeasurements: Seq.BOOLEAN,  //can add/remove/update measurements anywhere
        viewMeasurements: Seq.BOOLEAN,  //can view measurements anywhere
        editCategories: Seq.BOOLEAN,    //can add/remove/update measurement categories
        viewCategories: Seq.BOOLEAN,    //can view measurement categories
        editFarmPermissions: Seq.BOOLEAN,   //can edit all permissions
        viewFarmPermissions: Seq.BOOLEAN,   //can view all permissions
        editUsers: Seq.BOOLEAN,         //can add/remove/update users
        viewUsers: Seq.BOOLEAN         //can view other users
    },

    relations:{
        User: {type: 'hasMany', opt: {as: 'users', onDelete: 'cascade', foreignKey: 'globalRoleId'}}
    },

    options:{
        freezeTableName: true,
        classMethods: {
            getPermissionNames: function () {
                var names = ['Algorithms', 'Animals', 'Farms', 'FarmRoles', 'GlobalRoles', 'Herds', 'Measurements', 'Categories',
                    'FarmPermissions', 'Users'];
                return names;
            }
        }
    }
};