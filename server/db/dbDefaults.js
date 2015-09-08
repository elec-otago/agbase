/**
 * Database Seeds
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Mark Butler, Tim Molteno
 *
 **/

var wizardRole = {
    name: 'wizard',
    editAlgorithms: true, //can add/remove/update Algorithms
    viewAlgorithms: true, //can view measurement Algorithms
    editAnimals: true,   //can create/edit/remove Animals from anywhere
    viewAnimals: true,   //can view Animals from anywhere
    editFarms: true,     //can create/edit/remove farms
    viewFarms: true,     //can view other farms than ones the user is associated to
    editFarmRoles: true,     //can create/edit/remove farmRoles
    viewFarmRoles: true,     //can view all farm roles
    editGlobalRoles: true,   //can create/edit global roles
    viewGlobalRoles: true,   //can view all global roles
    editHerds: true,         //can create/edit/remove Herds from anywhere
    viewHerds: true,         //can view other Herds than ones in the farm the user is associated to
    editMeasurements: true,  //can add/remove/update measurements anywhere
    viewMeasurements: true,  //can view measurements anywhere
    editCategories: true,    //can add/remove/update measurement categories
    viewCategories: true,    //can view measurement categories
    editFarmPermissions: true,   //can edit all permissions
    viewFarmPermissions: true,   //can view all permissions
    editUsers: true,         //can add/remove/update users
    viewUsers: true         //can view other users
};


var adminRole = {
    name: 'admin',
    editAlgorithms: true, //can add/remove/update Algorithms
    viewAlgorithms: true, //can view measurement Algorithms
    editAnimals: true,   //can create/edit/remove Animals from anywhere
    viewAnimals: true,   //can view Animals from anywhere
    editFarms: true,     //can create/edit/remove farms
    viewFarms: true,     //can view other farms than ones the user is associated to
    editFarmRoles: true,     //can create/edit/remove farmRoles
    viewFarmRoles: true,     //can view all farm roles
    editGlobalRoles: false,   //can create/edit global roles
    viewGlobalRoles: true,   //can view all global roles
    editHerds: true,         //can create/edit/remove Herds from anywhere
    viewHerds: true,         //can view other Herds than ones in the farm the user is associated to
    editMeasurements: true,  //can add/remove/update measurements anywhere
    viewMeasurements: true,  //can view measurements anywhere
    editCategories: true,    //can add/remove/update measurement categories
    viewCategories: true,    //can view measurement categories
    editFarmPermissions: true,   //can edit all permissions
    viewFarmPermissions: true,   //can view all permissions
    editUsers: true,         //can add/remove/update users
    viewUsers: true         //can view other users
};


var userRole = {
    name: 'user',
    editAlgorithms: false, //can add/remove/update Algorithms
    viewAlgorithms: true, //can view measurement Algorithms
    editAnimals: false,   //can create/edit/remove Animals from anywhere
    viewAnimals: false,   //can view Animals from anywhere
    editFarms: false,     //can create/edit/remove farms
    viewFarms: false,     //can view other farms than ones the user is associated to
    editFarmRoles: false,    //can create/edit/remove all farmRoles
    viewFarmRoles: true,     //can view all farm roles
    editGlobalRoles: false,   //can create/edit global roles
    viewGlobalRoles: true,   //can view all global roles
    editHerds: false,         //can create/edit/remove Herds from anywhere
    viewHerds: false,         //can view other Herds than ones in the farm the user is associated to
    editMeasurements: false,  //can add/remove/update measurements anywhere
    viewMeasurements: false,  //can view measurements anywhere
    editCategories: false,    //can add/remove/update measurement categories
    viewCategories: true,    //can view measurement categories
    editFarmPermissions: false,   //can edit all permissions
    viewFarmPermissions: false,   //can view all permissions
    editUsers: false,           //can add/remove/update users
    viewUsers: true             //can view other users
};


var managerFarmRole = {
    name: 'Manager',
    editFarmPermissions: true,
    viewFarmPermissions: true,  //can view what users have permission in the farm
    editFarmHerds: true,        //can add/remove herds in the farm
    viewFarmHerds: true,        //can view the herds in the farm
    editFarmAnimals: true,      //can add/remove animals in the farm
    viewFarmAnimals: true,      //can view the animals in the farm
    editFarmMeasurements: true, //can add/remove measurements to animals in the farm
    viewFarmMeasurements: true,  //can view measurements on the animals in the farm
    inviteUsers: true
};


var viewerFarmRole = {
    name: 'Viewer',
    editFarmPermissions: false,
    viewFarmPermissions: true,      //can view what users have permission in the farm
    editFarmHerds: false,           //can add/remove herds in the farm
    viewFarmHerds: true,            //can view the herds in the farm
    editFarmAnimals: false,         //can add/remove animals in the farm
    viewFarmAnimals: true,          //can view the animals in the farm
    editFarmMeasurements: false,    //can add/remove measurements to animals in the farm
    viewFarmMeasurements: true,      //can view measurements on the animals in the farm
    inviteUsers: false
};


var unlimitedTier = {
    name:'unlimited',
    dailyRequests: 1000000000
};

var tier1 = {
    name: 'tier1',
    dailyRequests: 10000
};

var wizardUser = {
    email: 'wizard@agbase.elec.ac.nz',
    password: 'password',
    firstName: 'Wizard',
    lastName: 'AgBase',
    globalRoleName: wizardRole.name,
    usageTierName: unlimitedTier.name
};


var testUser = {
    email: 'unittest@agbase.elec.ac.nz',
    password: 'test',
    firstName: 'unittest',
    lastName: 'AgBase',
    globalRoleName: wizardRole.name,
    usageTierName: unlimitedTier.name
};


var adminUser = {
    email: 'admin@agbase.elec.ac.nz',
    password: 'wow123',
    firstName: 'Admin',
    lastName: 'AgBase',
    globalRoleName: adminRole.name,
    usageTierName: unlimitedTier.name
};


var demoUser = {
    email: 'demo@agbase.elec.ac.nz',
    password: 'wowdemo',
    firstName: 'Demo',
    lastName: 'AgBase',
    globalRoleName: userRole.name,
    usageTierName: tier1.name
};


var demoFarmManager = {
    email: 'demo-manager@agbase.elec.ac.nz',
    password: 'password',
    firstName: 'GuestManager',
    lastName: 'Manager',
    globalRoleName: userRole.name,
    usageTierName: tier1.name
};

//Default Farms
var demoFarm = {name: 'Demo Farm'};

//Default Herds
var demoHerd1 = { name: 'Demo Herd 1', farmName: demoFarm.name };
var demoHerd2 = { name: 'Demo Herd 2', farmName: demoFarm.name };


//default farm permissions
var demoFarmManagerPermission =
{
    farmName: demoFarm.name,
    userName: wizardUser.email,
    farmRoleName: managerFarmRole.name
};

var demoFarmViewerPermission =
{
    farmName: demoFarm.name,
    userName: demoUser.email,
    farmRoleName: viewerFarmRole.name
};


//Default Categories
var demoCategory = { name: 'Demo Category'};
var conditionScoreCategory = {name: "Condition Score"};
var weightCategory = {name: "Weight"};
var pastureLengthCategory = {name: "Pasture Length", isSpatial: true};

//Default Algorithms
var demoAlgorithm = { name: 'Demo Algorithm', measurementCategoryName: demoCategory.name};
var csStandardAlgorithm = { name: 'DairyNZ BCS', measurementCategoryName: conditionScoreCategory.name};
var weightManualAlgorithm = { name: 'Manual', measurementCategoryName: weightCategory.name};
var cdaxAlgorithm = { name: 'C-Dax Pasture Meter', measurementCategoryName: pastureLengthCategory.name};
var smartDeviceAlgorithm = { name: 'Smart Device', measurementCategoryName: pastureLengthCategory.name};

exports.defaultAlgorithms = [demoAlgorithm, csStandardAlgorithm, weightManualAlgorithm, cdaxAlgorithm, smartDeviceAlgorithm];

exports.defaultGlobalRoles = [wizardRole, adminRole, userRole];

exports.defaultUsageTiers = [tier1, unlimitedTier];
exports.usageTier1 = tier1;
exports.usageTierUnlimited = unlimitedTier;
exports.usageTierMapByName = {};

exports.defaultUsers = [wizardUser, adminUser, testUser, demoUser];

exports.testUser = testUser;
exports.guestUser = demoUser;
exports.demoFarmManager = demoFarmManager;
exports.demoFarm = demoFarm;
exports.demoHerds = [demoHerd1, demoHerd2];


exports.defaultCategories = [demoCategory, conditionScoreCategory, weightCategory, pastureLengthCategory];

exports.defaultFarmRoles = [managerFarmRole, viewerFarmRole];

exports.defaultFarmPermissions = [demoFarmManagerPermission, demoFarmViewerPermission];
