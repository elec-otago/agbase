var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var FarmController = require('./FarmController');

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
exports.getHerds = function(params) {

    return helpers.findAll(orm.model("Herd"), params);
};


var createHerdInFarmWithName = function(farmName, herdName){

    return FarmController.getFarms({where: {name: farmName}})
        .then(function(farms) {
            return createHerd(farms[0].id, herdName);
        });
};

exports.createMultipleHerds = function(herds){

    return Promise.promiseForArray(herds, function(herdDetails) {
        if (herdDetails.farmId) {
            return createHerd(herdDetails.farmId, herdDetails.name);
        } else if (herdDetails.farmName) {
            return createHerdInFarmWithName(herdDetails.farmName, herdDetails.name);
        } else {
            return helpers.rejectWithValidationError('no farm id provided');
        }
    });
};

exports.getHerd = function(query){

    query = helpers.createParamsForIdIfRequired(query);
    return helpers.findOne(orm.model("Herd"), query);
};

exports.removeHerd = function (query, authCallback){

    query = helpers.createParamsForIdIfRequired(query);
    return helpers.removeOne(orm.model("Herd"), query, authCallback);
};

exports.updateHerd = function(query, herdDetails, authCallback){

    query = helpers.createParamsForIdIfRequired(query);

    return helpers.updateOne(orm.model("Herd"), query, authCallback, function(herd) {
        if (herdDetails.name) {
            herd.name = herdDetails.name;
        }
    });
};

function createHerd(farmID, herdName){

    if(typeof herdName !== "string"){
        return helpers.rejectWithValidationError("Invalid herd name");
    }

    if(!herdName){
        return helpers.rejectWithValidationError("herd name required");
    }

    if(!farmID){
        return helpers.rejectWithValidationError("farmId required");
    }

    return helpers.findOrCreateEntityOnly(orm.model("Herd"), {
        name: herdName,
        farmId: farmID
    });
}

exports.createHerd = createHerd;