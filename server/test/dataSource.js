/*
 * Create database in a known state:
 *      - 2 Farms
 *      - 2 Paddocks per farm
 *      - 2 Herds per farm
 *      - 4 Animals per farm (1 each herd, 2 no herd)
 *      - 3 Measurement categories
 *      - 3 Algorithms
 *      - 4 Pasture Measurements per Paddock
 *      - Global roles from dbDefaults
 *      - Farm roles from dbDefaults
 *      - Users from dbDefaults
 *      - No farm permissions
 *
 * The database is wiped before executing each test suite.
 *
 * Access data like:
 *
 *     dataSource.farm1
 *     dataSource.farm1.herd1
 *     dataSource.farm1.herd1.animal
 *     dataSource.farm1.animal1 (not in herd)
 *     dataSource.farm1.animal2 (not in herd)
 *     dataSource.measurementCategory1.algorithm
 *     dataSource.wizardUser, unittest, admin, demo, guest, etc.
 *     dataSource.wizardRole, adminRole, userRole, etc.
 *     dataSource.managerFarmRole, etc.
 *
 */


var common = require('./common');
var orm = agquire('ag/db/orm');
var app = agquire('ag/app');
wowDB = agquire('ag/db/db');

var dbDefaults = agquire('ag/db/dbDefaults');
var forEach = agquire('ag/utils/forEachIn');

var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');
var GlobalRoleController = agquire('ag/db/controllers/GlobalRoleController');
var FarmController = agquire('ag/db/controllers/FarmController');
var UserController = agquire('ag/db/controllers/UserController');
var FarmPermissionController = agquire('ag/db/controllers/FarmPermissionController');
var AnimalController = agquire('ag/db/controllers/AnimalController');
var HerdController = agquire('ag/db/controllers/HerdController');
var MeasurementCategoryController = agquire('ag/db/controllers/MeasurementCategoryController');
var AlgorithmController = agquire('ag/db/controllers/AlgorithmController');
var PaddockController = agquire('ag/db/controllers/PaddockController');
var ReadingController = agquire('ag/db/controllers/ReadingController');
var UsageTierController = agquire('ag/db/controllers/UsageTierController');
var Transaction = agquire('ag/db/controllers/Transaction');

var Promise = agquire('ag/wowPromise');


var exports = {};

var camelCaseKey = function(key) {
    return key[0].toLowerCase() + key.slice(1);
};

var randomString = function(n) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    if (arguments.length === 1) {
        n = 10;
    }

    for(var i = 0; i < n; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};
// returns a random lat/lon coordinate pair
var randomCoord = function() {
  
    var lon = Math.random() * 360 - 180;
    var lat = Math.random() * 180 - 90;
    
    return [lon, lat];
};

var createFarms = function(n) {
    var farmNames = [];
    for (var x = 0; x < n; x++) {
        farmNames.push({name: randomString(8)});
    }


    return FarmController.createMultipleFarms(farmNames).then(function(createdFarms) {
        should.exist(createdFarms);

        createdFarms.length.should.equal(n);

        return createdFarms;
    });
};

// create n in each farm
var createHerds = function(n, farms) {

    var herds = [];
    forEach(farms, function(farm) {
       for (var x = 0; x < n; x++) {
           herds.push({
               name: randomString(10),
               farmId: farm.id
           });
       }
    });

    return HerdController.createMultipleHerds(herds).then(function(createdHerds) {
        should.exist(createdHerds);

        createdHerds.length.should.equal(herds.length);

        return createdHerds;
    });
};

// create n animals in each herd
var createAnimalsInHerds = function(n, herds) {
    var animals = [];
    forEach(herds, function(herd) {
        for (var x = 0; x < n; x++) {
            animals.push({
                eid: randomString(10),
                vid: randomString(10),
                farmId: herd.farmId,
                herdId: herd.id
            });
        }
    });

    return AnimalController.createMultipleAnimals(animals)
        .then(function(createdAnimals) {
            should.exist(createdAnimals);
            createdAnimals.length.should.equal(animals.length);

            return createdAnimals;
        });
};

var createAnimalsInFarms = function(n, farms) {
    var animals = [];
    forEach(farms, function(farm) {
        for (var x = 0; x < n; x++) {
            animals.push({
                eid: randomString(10),
                vid: randomString(10),
                farmId: farm.id
            });
        }
    });

    return AnimalController.createMultipleAnimals(animals).then(function(createdAnimals) {
        should.exist(createdAnimals);
        createdAnimals.length.should.equal(animals.length);

        return createdAnimals;
    });
};

// create n paddocks in each farm
var createPaddocksInFarms = function(n, farms) {
    var paddocks = [];
    forEach(farms, function(farm) {
        for(var x = 0; x < n; x++) {
            var coord = randomCoord();
            paddocks.push({
               name: randomString(10),
               farm_id: farm.id,
               loc: {
                    coordinates: [ 
                        coord, 
                        randomCoord(), 
                        randomCoord(),
                        randomCoord(),
                        coord 
                    ]
               }
            });
        }
    });

    return PaddockController.createPaddocks(paddocks);
};

var createPastureMeasurementsInPaddocks = function(n, paddocks) {
    var pastureMeasurements = [];
    forEach(paddocks, function(paddock) {
        for(var x = 0; x < n; x++) {
            pastureMeasurements.push({
                paddock_oid: paddock._id,
                length: Math.floor(Math.random() * 10 + 1),
                location: randomCoord()
            });
        }        
    });    

    return ReadingController.createReadings(pastureMeasurements);
};

var createMeasurementCategories = function(n) {
    var categories = [];
    for (var x = 0; x < n; x++) {
        categories.push({name: randomString(15)});
    }

    return MeasurementCategoryController.createMultipleMeasurementCategories(categories)
        .then(function(createdCategories) {
            should.exist(createdCategories);
            createdCategories.length.should.equal(categories.length);

            return createdCategories;
    });
};

var createAlgorithmsInCategories = function(n, categories) {
    var algorithms = [];
    forEach(categories, function(category) {
        for (var x = 0; x < n; x++) {
            algorithms.push({
                measurementCategoryId: category.id,
                name: randomString(20)
            });
        }
    });

    return AlgorithmController.createMultipleAlgorithms(algorithms)
        .then(function(createdAlgorithms) {

            should.exist(createdAlgorithms);
            createdAlgorithms.length.should.equal(algorithms.length);

            return createdAlgorithms;
        });
};

exports.setup = function() {

    if (process.env.NODE_ENV !== "unit_testing") {

        var msg = "\n" +
            "\n#######################################\n\n" +
            "The database is now wiped before executing each unit test.\n" +
            "Define the environment NODE_ENV to unit_testing and ensure there is a database\n" +
            "called 'wowdb_unittest' with the same details as normal. Also you will need mongo db 'dbPasture_unittest'.\n" +
            "Note: If you're running the route tests, then the server you're\n" +
            "connecting to should have NODE_ENV=unit_testing defined, too. Otherwise\n" +
            "they'll operate on different databases, and tests will fail.\n" +
            "\n#######################################\n";

        return Promise.reject(new Error(msg));
    }

    // TODO transactions
    var ctx = {};

    return wowDB.setup().bind(ctx)
        .then(function() {
            console.log('sync database');
            return orm.sequelize.sync({force: true});
        })
        .then(function() {

            return Transaction.begin(function(t) {
                console.log('dataSource: ' + t.id);
                return GlobalRoleController.createGlobalRoles(dbDefaults.defaultGlobalRoles).then(function(roles) {
                    ctx.roles = roles;

                    //should.not.exist(err);
                    should.exist(roles);
                    roles.length.should.equal(dbDefaults.defaultGlobalRoles.length);

                    forEach(roles, function (role) {
                        exports[role.name + 'Role'] = role;
                    });

                    return UsageTierController.createUsageTiers(dbDefaults.defaultUsageTiers);

                }).then(function(tiers){

                    ctx.usageTiers = tiers;

                    should.exist(tiers);
                    tiers.length.should.equal(dbDefaults.defaultUsageTiers.length);

                    forEach(tiers, function (tier) {
                        exports[tier.name + 'UsageTier'] = tier;
                    });

                    return FarmRoleController.createFarmRoles(dbDefaults.defaultFarmRoles);

                }).then(function(farmRoles) {
                    ctx.farmRoles = farmRoles;
                    //should.not.exist(err);
                    should.exist(farmRoles);
                    farmRoles.length.should.equal(dbDefaults.defaultFarmRoles.length);

                    forEach(farmRoles, function (farmRole) {
                        var key = camelCaseKey(farmRole.name + 'FarmRole');
                        exports[key] = farmRole;
                    });

                    return createMeasurementCategories(3);
                }).then(function(categories) {
                    ctx.categories = categories;
                    ctx.categoryIndex = 0;
                    ctx.categoryMap = {};
                    forEach(categories, function (category) {
                        var key = 'measurementCategory' + (++ctx.categoryIndex);
                        exports[key] = category;

                        ctx.categoryMap[category.id] = {category: category, numberOfAlgorithms: 0};
                    });

                    return createAlgorithmsInCategories(3, categories);
                }).then(function(algorithms) {
                    ctx.algorithms = algorithms;

                    forEach(algorithms, function (algorithm) {
                        var algorithmIndex = ++ctx.categoryMap[algorithm.measurementCategoryId].numberOfAlgorithms;
                        ctx.categoryMap[algorithm.measurementCategoryId].category['algorithm' + algorithmIndex] = algorithm;
                    });

                    return UserController.createUsers(dbDefaults.defaultUsers);
                }).then(function(users) {

                    ctx.users = users;

                    should.exist(users);
                    users.length.should.equal(dbDefaults.defaultUsers.length);

                    forEach(users, function (user) {
                        var key = camelCaseKey(user.firstName + 'User');
                        exports[key] = user;
                    });

                    return createFarms(2);
                }).then(function(farms) {
                    ctx.farms = farms;
                    ctx.farmIndex = 1;
                    ctx.farmMap = {};
                    forEach(farms, function (farm) {
                        exports['farm' + ctx.farmIndex] = farm;
                        ctx.farmMap[farm.id] = {farm: farm, numberOfHerds: 0, numberOfHerdlessAnimals: 0, numberOfPaddocks: 0};
                        ctx.farmIndex++;
                    });

                    return createHerds(2, farms);
                }).then(function(herds) {
                    ctx.herds = herds;
                    ctx.herdMap = {};
                    forEach(herds, function (herd) {
                        var herdIndex = ++ctx.farmMap[herd.farmId].numberOfHerds;
                        var key = 'herd' + herdIndex;
                        ctx.farmMap[herd.farmId].farm[key] = herd;

                        ctx.herdMap[herd.id] = {herd: herd, numberOfAnimals: 0};
                    });

                    return createAnimalsInHerds(1, herds);
                }).then(function(animals) {

                    forEach(animals, function (animal) {
                        var animalIndex = ++ctx.herdMap[animal.herdId].numberOfAnimals;
                        var key = 'animal' + animalIndex;
                        ctx.herdMap[animal.herdId].herd[key] = animal;
                    });

                    return createAnimalsInFarms(2, ctx.farms);
                }).then(function(animals) {
                    forEach(animals, function (animal) {
                        var animalIndex = ++ctx.farmMap[animal.farmId].numberOfHerdlessAnimals;
                        var key = 'animal' + animalIndex;
                        ctx.farmMap[animal.farmId].farm[key] = animal;
                    });

                    return createPaddocksInFarms(4,ctx.farms);

                }).then(function(paddocks){

                    ctx.paddocks = paddocks;
                    ctx.paddockMap = {};

                    forEach(paddocks, function (paddock) {
                        var paddockIndex = ++ctx.farmMap[paddock.farm_id].numberOfPaddocks;
                        var key = 'paddock' + paddockIndex;
                        ctx.farmMap[paddock.farm_id].farm[key] = paddock;

                        ctx.paddockMap[paddock._id] = {paddock: paddock, numberOfMeasurements: 0};
                    });

                    return createPastureMeasurementsInPaddocks(4, paddocks);

                }).then(function(pastureMeasurements){

                    ctx.pastureMeasurements = pastureMeasurements;
                    ctx.pastureMeasurementMap = {};

                    forEach(pastureMeasurements, function (measurement) {
                        var measurementIndex = ++ctx.paddockMap[measurement.paddock_oid].numberOfMeasurements;
                        var key = 'pastureMeasurement' + measurementIndex;
                        ctx.paddockMap[measurement.paddock_oid].paddock[key] = measurement;

                        ctx.pastureMeasurementMap[measurement._id] = {pastureMeasurement: measurement};
                    });
                });
            });
        });

};

exports.randomString = randomString;

module.exports = exports;
