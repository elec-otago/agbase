var defined = require('../../utils/defined');

var verifyPermission = function (permission, farmRole, globalRole) {
    var result = false;
    switch (permission) {
        // Animals
        case module.exports.kViewFarmAnimals:
            if (farmRole) {
                result = result || farmRole.viewFarmAnimals;
            }
            if (globalRole) {
                result = result || globalRole.viewAnimals;
            }
            break;
        case module.exports.kEditFarmAnimals:
            if (farmRole) {
                result = result || farmRole.editFarmAnimals;
            }
            if (globalRole) {
                result = result || globalRole.editAnimals;
            }
            break;

        // Herds
        case module.exports.kViewFarmHerds:
            if (farmRole) {
                result = result || farmRole.viewFarmHerds;
            }
            if (globalRole) {
                result = result || globalRole.viewHerds;
            }
            break;
        case module.exports.kEditFarmHerds:
            if (farmRole) {
                result = result || farmRole.editFarmHerds;
            }
            if (globalRole) {
                result = result || globalRole.editHerds;
            }
            break;

        // Measurements
        case module.exports.kViewFarmMeasurements:
            if (farmRole) {
                result = result || farmRole.viewFarmMeasurements;
            }
            if (globalRole) {
                result = result || globalRole.viewMeasurements;
            }
            break;
        case module.exports.kEditFarmMeasurements:
            if (farmRole) {
                result = result || farmRole.editFarmMeasurements;
            }
            if (globalRole) {
                result = result || globalRole.editMeasurements;
            }
            break;

        // FarmPermissions
        case module.exports.kViewFarmPermissions:
            if (farmRole) {
                result = result || farmRole.viewFarmPermissions;
            }
            if (globalRole) {
                result = result || globalRole.viewFarmPermissions;
            }
            break;
        case module.exports.kEditFarmPermissions:
            if (farmRole) {
                result = result || farmRole.editFarmPermissions;
            }
            if (globalRole) {
                result = result || globalRole.editFarmPermissions;
            }
            break;

        case module.exports.kViewFarms:
            if (farmRole) {
                // The existence of a FarmPermission implies they can view that farm
                result = result || farmRole !== null;
            }
            if (globalRole) {
                result = result || globalRole.viewFarms;
            }
            break;
        case module.exports.kEditFarms:
            if (farmRole) {
                // TODO: probably should add an explicit permission for editing a farm
                result = result || farmRole !== null;
            }
            if (globalRole) {
                result = result || globalRole.editFarms;
            }
            break;
        case module.exports.kInviteToFarm:
            if (farmRole) {
                result = result || farmRole.inviteUsers;
            }
            if (globalRole) {
                result = result || globalRole.editFarms;
            }
            break;

        // Global only permissions
        // Algorithms
        case module.exports.kViewGlobalAlgorithms:
            result = globalRole.viewAlgorithms;
            break;
        case module.exports.kEditGlobalAlgorithms:
            result = globalRole.editAlgorithms;
            break;

        // Categories
        case module.exports.kViewGlobalCategories:
            result = globalRole.viewCategories;
            break;
        case module.exports.kEditGlobalCategories:
            result = globalRole.editCategories;
            break;

        // FarmRoles
        case module.exports.kViewGlobalFarmRoles:
            result = globalRole.viewFarmRoles;
            break;
        case module.exports.kEditGlobalFarmRoles:
            result = globalRole.editFarmRoles;
            break;

        // GlobalRoles
        case module.exports.kViewGlobalRoles:
            result = globalRole.viewGlobalRoles;
            break;
        case module.exports.kEditGlobalRoles:
            result = globalRole.editGlobalRoles;
            break;

        // Users
        case module.exports.kViewGlobalUsers:
            result = globalRole.viewUsers;
            break;
        case module.exports.kEditGlobalUsers:
            result = globalRole.editUsers;
            break;
    }

    return result;
};

var permissionName = function(permission) {
    switch (permission) {
        // Animals
        case module.exports.kViewFarmAnimals:
            return 'view animals';
        case module.exports.kEditFarmAnimals:
            return 'edit animals';
        // Herds
        case module.exports.kViewFarmHerds:
            return 'view herds';
        case module.exports.kEditFarmHerds:
            return 'edit herds';

        // Measurements
        case module.exports.kViewFarmMeasurements:
            return 'view measurements';
        case module.exports.kEditFarmMeasurements:
            return 'edit measurements';

        // FarmPermissions
        case module.exports.kViewFarmPermissions:
            return 'view farm permissions';
        case module.exports.kEditFarmPermissions:
            return 'edit farm permissions';

        case module.exports.kViewFarms:
            return 'view farms';
        case module.exports.kEditFarms:
            return 'edit farms';

        case module.exports.kInviteToFarm:
            return 'invite users';

        // Global only permissions
        // Algorithms
        case module.exports.kViewGlobalAlgorithms:
            return 'view algorithms';
        case module.exports.kEditGlobalAlgorithms:
            return 'edit algorithms';
        // Categories
        case module.exports.kViewGlobalCategories:
            return 'view measurement categories';
        case module.exports.kEditGlobalCategories:
            return 'edit measurement categories';

        // FarmRoles
        case module.exports.kViewGlobalFarmRoles:
            return 'view farm roles';
        case module.exports.kEditGlobalFarmRoles:
            return 'edit farm roles';

        // GlobalRoles
        case module.exports.kViewGlobalRoles:
            return 'view global roles';
        case module.exports.kEditGlobalRoles:
            return 'edit global roles';

        // Users
        case module.exports.kViewGlobalUsers:
            return 'view users';
        case module.exports.kEditGlobalUsers:
            return 'edit users';
    }
    return 'unknown';
};

module.exports = {
    // Farm specific permissions
    kViewFarmAnimals: 1,
    kEditFarmAnimals: 2,
    kViewFarmHerds: 3,
    kEditFarmHerds: 4,
    kViewFarmMeasurements: 5,
    kEditFarmMeasurements: 6,
    kViewFarmPermissions: 7,
    kEditFarmPermissions: 8,
    kInviteToFarm: 9,

    // This is a somewhat different permission because
    // it represents a user being able to view/edit a farm.
    // There is no corresponding FarmRole permission for this
    // because the existence of a FarmPermission implies it.
    // However, this also represents the global viewFarms/editFarms
    // permission.
    kViewFarms: 10,
    kEditFarms: 11,

    // Global permissions
    // Note that we only define the ones that
    // have no analogous farm permission
    kViewGlobalAlgorithms: 100,
    kEditGlobalAlgorithms: 101,
    kViewGlobalCategories: 102,
    kEditGlobalCategories: 103,
    kViewGlobalFarmRoles: 104,
    kEditGlobalFarmRoles: 105,
    kViewGlobalRoles: 106,
    kEditGlobalRoles: 107,
    kViewGlobalUsers: 108,
    kEditGlobalUsers: 109,


    verifyPermission: verifyPermission,
    permissionName: permissionName,
    wouldRequire: function (oldValue, newValue) {
        return defined(newValue) && newValue !== oldValue;
    }

};