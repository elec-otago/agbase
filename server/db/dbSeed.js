/**
 * Performs Seeding of database with default values, to be called during ORM setup
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

var defaults = agquire('ag/db/dbDefaults');
var forEach = agquire ('ag/utils/forEachIn');

var UserController = agquire('ag/db/controllers/UserController');
var GlobalRoleController = agquire('ag/db/controllers/GlobalRoleController');
var UsageTierController = agquire('ag/db/controllers/UsageTierController');
var FarmController = agquire('ag/db/controllers/FarmController');
var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');
var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');
var HerdController = agquire('ag/db/controllers/HerdController');
var AnimalController = agquire('ag/db/controllers/AnimalController');
var MeasurementCategoryController = agquire('ag/db/controllers/MeasurementCategoryController');
var AlgorithmController = agquire('ag/db/controllers/AlgorithmController');


var createDemoData = function(viewerRole, managerRole){

    console.log("Creating Guest User");
    return UserController.createSingleUser(defaults.guestUser)
        .bind({})
        .then(function(user) {
            console.log("Creating demo farm manager");
            this.user = user;
            return UserController.createSingleUser(defaults.demoFarmManager);
        }).then(function(managerUser) {
            console.log("Creating Demo Farm");
            this.managerUser = managerUser;
            return FarmController.createFarm(defaults.demoFarm.name);
        }).then(function(farm) {
            console.log("Adding Permissions between demo user and demo farm");
            this.farm = farm;
            return FarmPermissionController.createFarmPermission(this.user.id, farm.id, viewerRole.id);
        }).then(function() {
            console.log("Adding Permissions between demo farm manager and demo farm");
            return FarmPermissionController.createFarmPermission(this.managerUser.id, this.farm.id, managerRole.id);
        }).then(function() {
            console.log("Adding herds to Demo Farm");
            return HerdController.createMultipleHerds(defaults.demoHerds);
        });
};

/*
 * adds farmViewerRole and farmManagerRole to defaults
 */
var createRequiredUsersAndRoles = function(){

    return GlobalRoleController.createGlobalRoles(defaults.defaultGlobalRoles).then(function() {

        console.log("Created Default Roles");

        //also call update in case we change their permissions
        return GlobalRoleController.updateGlobalRoles(defaults.defaultGlobalRoles);
    }).then(function(){

        console.log('creating usage tiers');

        return UsageTierController.createUsageTiers(defaults.defaultUsageTiers);

    }).then(function(tiers){



        forEach(tiers, function(tier){

            if(tier.name === defaults.usageTierUnlimited.name){
                defaults.usageTierUnlimited = tier;
            }else if (tier.name === defaults.usageTier1.name){
                defaults.usageTier1 = tier;
            }

            defaults.usageTierMapByName[tier.name] = tier;
        });

    }).then(function() {
        return UserController.createUsers(defaults.defaultUsers);
    }).then(function(usersCreated) {
        if (! usersCreated) {
            console.log("Default users already exist");
        } else {
            console.log("created " + usersCreated.length + " default users");
        }

        console.log("Creating Default Farm Roles");

        return FarmRoleController.createFarmRoles(defaults.defaultFarmRoles);
    }).then(function() {
        return FarmRoleController.updateFarmRoles(defaults.defaultFarmRoles);
    }).then(function(roles) {
        for (var roleKey in roles) {

            if (roles.hasOwnProperty(roleKey)) {

                if (roles[roleKey].name === 'Viewer') {
                    defaults.farmViewerRole = roles[roleKey];
                }

                if (roles[roleKey].name === 'Manager') {
                    defaults.farmManagerRole = roles[roleKey];
                }
            }
        }
    });
};


var createRequiredCategoriesAndAlgorithms = function(){

    return MeasurementCategoryController
        .createMultipleMeasurementCategories(defaults.defaultCategories)
        .then(function() {
           return AlgorithmController.createMultipleAlgorithms(defaults.defaultAlgorithms);
        });
};


/*
 * @param callback - function(seedData) where seedData is the result of the database seed and is a dbDefaults object
 */
exports.seed = function(){

    return createRequiredCategoriesAndAlgorithms().then(function() {
        return createRequiredUsersAndRoles();
    }).then(function() {
        return createDemoData(defaults.farmViewerRole, defaults.farmManagerRole);
    }).then(function(){
        return defaults;
    });
};

