var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var FarmController = require('./FarmController');
var HerdController = require('./HerdController');
var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');

/**
 * Get all animals matching the specified query
 * @param query query to perform
 */
exports.getAnimals = function(query){

    var Animal = orm.model("Animal");
    return helpers.findAll(Animal, query);
};

exports.countAnimals = function(query) {
    var Animal = orm.model("Animal");
    return helpers.count(Animal, query);
};

var createAnimal = function(farmId, herdId, eid, vid){

    var params = {};

    if(eid){
        params.eid = eid;
    }

    if(vid){
        params.vid = vid;
    }

    if(herdId){
        params.herdId = herdId;
    }

    params.farmId = farmId;

    return helpers.createOne(orm.model("Animal"), params);
};


/**
 * Get the specific animal matching the specified query
 * @param query query to perform (or a number containing the id to retrieve)
 */
exports.getAnimal = function(query){

    var Animal = orm.model("Animal");
    query = helpers.createParamsForIdIfRequired(query);
    return helpers.findOne(Animal, query);
};

exports.getOrCreateAnimal = function(animalId, farmId, herdId, eid, vid) {
    var Animal = orm.model("Animal");

    var where = {};

    if (animalId) {
        return exports.getAnimal({where: {id: animalId}});
    } else {
        if (!farmId) {
            return helpers.rejectWithValidationError('farmId must be provided');
        }
        if (!eid && !vid) {
            return helpers.rejectWithValidationError('either eid or vid must be provided');
        }

        // don't query on herdId because eid and vid should
        // be unique within a farm, so herdId would be a useless
        // predicate.

        where.farmId = farmId;
        // TODO: merge animals when vid/eids are found (Will need to change query)
        if (eid) {
            where.eid = eid;
        }
        if (vid) {
            where.vid = vid;
        }
    }

    var attributes = JSON.parse(JSON.stringify(where));
    if (herdId) {
        attributes.herdId = herdId;
    }

    return helpers.findOrCreateEntityOnly(Animal, where, attributes);
};


/*
 * callback(err)
 */
exports.removeAnimal = function (query, authCallback){

    var Animal = orm.model("Animal");
    query = helpers.createParamsForIdIfRequired(query);
    return helpers.removeOne(Animal, query, authCallback);
};

//allows update of vid, farmId, HerdId
exports.updateAnimal = function (query, animalDetails, authCallback){

    var Animal = orm.model("Animal");
    query = helpers.createParamsForIdIfRequired(query);
    return helpers.updateOne(Animal, query, authCallback, function(animal) {
        if (animalDetails.vid) {
            animal.vid = animalDetails.vid;
        }
        if (animalDetails.herdId) {
            animal.herdId = animalDetails.herdId;
        }
        if (animalDetails.farmId) {
            animal.farmId = animalDetails.farmId;
        }
    });
};

exports.mergeAnimals = function (destAnimalId, sourceAnimalId, authCallback) {

    var MeasurementController = require('./MeasurementController');
    var src = null, dst = null;

    if (destAnimalId == sourceAnimalId) {
        return helpers.rejectWithError('source and destination must be different');
    }

    var Animal = orm.model("Animal");
    return helpers.findAll(Animal, {where: {id: {in: [destAnimalId, sourceAnimalId]}}})
        .then(function(animals) {

            forEach(animals, function(animal) {
                // == for string conversions
                if (animal.id == destAnimalId) {
                    dst = animal;
                } else if (animal.id == sourceAnimalId) {
                    src = animal;
                }
            });

            if (src === null || dst === null) {
                return helpers.rejectWithError('cannot find specified animals');
            }

            // This callback should ensure the user is able to edit/delete
            // the animals. No other checks are made.
            if (authCallback && !authCallback([src, dst], 'animals')) {
                var Errors = require('../Errors');
                return Promise.reject(new Errors.AuthorizationError());
            }

            if (src.farmId !== dst.farmId) {
                return helpers.rejectWithValidationError('animals not on same farm');
            }

            return MeasurementController.getMeasurements({where: {animalId: src.id}});
        }).then(function(measurements) {
            if (authCallback && !authCallback(measurements, 'measurements')) {
                var Errors = require('../Errors');
                return Promise.reject(new Errors.AuthorizationError());
            }

            return Promise.promiseForArray(measurements, function(measurement) {
                measurement.animalId = dst.id;
                return helpers.saveEntity(measurement);
            });
        }).then(function() {
            var vid, herdId;

            vid = src.vid;
            herdId = src.herdId;

            return helpers.removeEntity(src)
                .then(function() {
                    if (vid) {
                        dst.vid = vid;
                    }
                    if (herdId) {
                        dst.herdId = src.herdId;
                    }

                    return helpers.saveEntity(dst);
                });
        }).catch(function(err) {
            return Promise.reject(err);
        });
};


function createAnimalInFarmWithName(farmName, herdId, eid, vid){

    return FarmController.getFarm({where: {name: farmName}})
        .then(function(farm) {
            return createAnimal(farm.id, herdId, eid, vid);
        });
}


exports.createMultipleAnimals = function(animals){

    return Promise.promiseForArray(animals, function(animalDetails) {
        console.log("creating animal with eid: " + animalDetails.eid);

        if (!animalDetails.farmId && !animalDetails.farmName) {
            return helpers.rejectWithValidationError('no farm info provided');
        }

        if (animalDetails.farmId) {
            return createAnimal(animalDetails.farmId, animalDetails.herdId, animalDetails.eid, animalDetails.vid);
        } else {
            return createAnimalInFarmWithName(animalDetails.farmName, animalDetails.herdId, animalDetails.eid, animalDetails.vid);
        }
    });
};

exports.createAnimal = createAnimal;