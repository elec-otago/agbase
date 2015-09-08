var orm = agquire('ag/db/orm');
var helpers = agquire('ag/db/controllers/utils/helpers');
var UserController = agquire('ag/db/controllers/UserController');
var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');

/*
 * Accepts generic query format:
 *
 * {
 *  where: {animalId: 5, algorithmId: 4, 'animal.farmId' : 4, ...},
 *  include: ['animal', 'user', 'algorithm', ...],
 *  offset: 100,
 *  limit: 50,
 *  order: {by: 'timeStamp' sort: 'ascending'}
 * }
 */
exports.getFarms = function(params){

    var Farm = orm.model("Farm");
    return helpers.findAll(Farm, params);
};


var createFarm = function (farmName){

    var Farm = orm.model("Farm");
    return helpers.findOrCreateEntityOnly(Farm, {name: farmName});
};


exports.createMultipleFarms = function(farms){

    return Promise.promiseForArray(farms, function(farmDetails) {
       return createFarm(farmDetails.name);
    });
};


exports.getFarm = function(params) {

    var Farm = orm.model("Farm");
    params = helpers.createParamsForIdIfRequired(params);
    return helpers.findOne(Farm, params);
};


exports.removeFarm = function (query, authCallback) {

    var Farm = orm.model("Farm");
    query = helpers.createParamsForIdIfRequired(query);
    return helpers.removeOne(Farm, query, authCallback);
};


/*
 * callback(err)
 */
exports.updateFarm = function (query, farmDetails, authCallback){

    var Farm = orm.model("Farm");
    query = helpers.createParamsForIdIfRequired(query);

    return helpers.updateOne(Farm, query, authCallback, function(farm) {
        if (farmDetails.name) {
            farm.name = farmDetails.name;
        }
    });
};


exports.createFarm = createFarm;