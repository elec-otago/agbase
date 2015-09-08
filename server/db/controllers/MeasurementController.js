var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var AnimalController = require('./AnimalController');
var AlgorithmController = require('./AlgorithmController');
var UserController = require('./UserController');
var appConfig = agquire('ag/appConfig');
var defined = agquire('ag/utils/defined');

var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');

var prepareQuery = function(params) {
    // farm and herd are on the animal, so change it
    helpers.moveAttributesIntoRelation(params, 'animal', ['herdId', 'farmId']);
    return params;
};

exports.getMeasurements = function(params){

    params = prepareQuery(params);
    return helpers.findAll(orm.model("Measurement"), params);
};

exports.countMeasurements = function(params){

    params = prepareQuery(params);
    return helpers.count(orm.model("Measurement"), params);
};

var createRawMeasurement = function(animalId, algorithmId, userId, measurementDetails){

    if (!(measurementDetails.timeStamp instanceof Date)) {
        if (isNaN(measurementDetails.timeStamp)) {
            var parsed = Date.parse(measurementDetails.timeStamp);
            if (isNaN(parsed)) {
                return helpers.rejectWithValidationError('timeStamp invalid');
            } else {
                measurementDetails.timeStamp = parsed;
            }
        }

        measurementDetails.timeStamp = new Date(measurementDetails.timeStamp);
    }

    var toNumber = function(x) {
        return x != null ? Number(x) : null;
    };

    return helpers.createOne(orm.model("Measurement"), {
        w05: toNumber(measurementDetails.w05),
        w25: toNumber(measurementDetails.w25),
        w50: toNumber(measurementDetails.w50),
        w75: toNumber(measurementDetails.w75),
        w95: toNumber(measurementDetails.w95),
        comment: measurementDetails.comment,
        timeStamp: measurementDetails.timeStamp,
        animalId: animalId,
        algorithmId: algorithmId,
        userId: userId
    });
};

var resolveAnimal = function(animalInfo, farmId) {
    var animalId = animalInfo.animalId;
    var eid = animalInfo.eid;
    var vid = animalInfo.vid;

    if (! animalId && ! eid && ! vid) {
        return helpers.rejectWithValidationError('no animal info supplied');
    }

    var promise;

    if (animalId) {
        promise = AnimalController.getAnimal(animalId);
    } else {
        promise = AnimalController.getOrCreateAnimal(null, farmId, animalInfo.herdId, eid, vid);
    }

    return promise.then(function(animal) {
        if (farmId && animal.farmId !== farmId) {
            return helpers.rejectWithValidationError('farm/animal mismatch');
        } else {
            return animal.id;
        }
    });
};


exports.createMeasurementsForAnimal = function(animalInfo, farmId,  algorithmId, userId, measurements){

    return resolveAnimal(animalInfo, farmId)
        .then(function(animalId) {
            return Promise.promiseForArray(measurements, function(measurementDetails) {
                return createRawMeasurement(animalId, algorithmId, userId, measurementDetails);
            });
        });
};


exports.createMeasurementsForFarm = function(farmId, algorithmId, userId, measurements){

    if(! farmId){
        return helpers.rejectWithValidationError('farmId not provided');
    }

    return Promise.promiseForArray(measurements, function(measurementDetails){

        var animalInfo = {
            eid:measurementDetails.eid,
            vid:measurementDetails.vid,
            herdId: measurementDetails.herdId,
            animalId: measurementDetails.animalId
        };

        return resolveAnimal(animalInfo, farmId)
            .then(function(animalId){
                return createRawMeasurement(animalId, algorithmId, userId, measurementDetails);
            });
    });
};


exports.createMeasurement = function(animalInfo, farmId, algorithmId, userId, measurementDetails) {
    return resolveAnimal(animalInfo, farmId)
        .then(function(animalId) {
            return createRawMeasurement(animalId, algorithmId, userId, measurementDetails);
        });
};

/**
 * Get a single measurement
 * @param params either a typical query or an integer containing the measurement id
 */
exports.getMeasurement = function(params){

    params = helpers.createParamsForIdIfRequired(params);
    return helpers.findOne(orm.model("Measurement"), params);
};

/**
 * Remove a single measurement
 * @param params either a typical query or an integer containing the measurement id
 * @param authCallback
 */
exports.removeMeasurement = function (params, authCallback){

    params = helpers.createParamsForIdIfRequired(params);
    return helpers.removeOne(orm.model("Measurement"), params, authCallback);
};

exports.findRecentMeasurements = function(query, windowMinutes, limit) {

    if (!windowMinutes) {
        windowMinutes = 60;
    }

    if (arguments.length !== 3) {
        limit = 1;
    } else {
        limit = Number(limit);
    }

    if (limit === 0) {
        return helpers.rejectWithNoResultError('limit set to 0');
    }

    if (isNaN(limit)) {
        return helpers.rejectWithError('invalid limit');
    }

    var windowMs = windowMinutes * 60 * 1000;

    query.order = {by: "timeStamp", sort:"DESC"};
    query.limit = 1000;
    query.offset = 0;
    query.include = ['animal']; //for farmId which is always required

    query = prepareQuery(query);

    var current = {
        startDate: null,
        endDate: null,
        count: 0
    };

    var results = [current];
    var previous = null;
    var done = false;
    var dbIndex = 0;

    function processPage(measurements) {
        if (!measurements || measurements.length === 0) {
            return Promise.resolve();
        }

        // TODO convert this to a binary search
        forEach(measurements, function(measurement) {
            if (previous) {
                var dt = previous.timeStamp.getTime() - measurement.timeStamp.getTime();
                if (dt <= windowMs) {
                    current.startDate = measurement.timeStamp;
                } else {

                    if (results.length === limit) {
                        done = true;
                        return false; // to break
                    } else {
                        current = {
                            startDate: measurement.timeStamp,
                            endDate: measurement.timeStamp,
                            count: 0
                        };

                        results.push(current);
                    }
                }
            } else {
                current.startDate = measurement.timeStamp;
                current.endDate = measurement.timeStamp;
                current.count = 0;
            }

            previous = measurement;
            current.count++;
        });

        if (!done && measurements.length >= query.limit) {
            dbIndex += measurements.length;

            // Need another page
            query.offset = dbIndex;
            return helpers.findAll(orm.model("Measurement"), query).then(processPage);
        } else {
            return Promise.resolve();
        }
    }

    return helpers.findAll(orm.model("Measurement"), query)
        .then(processPage)
        .then(function() {
            return limit === 1 ? results[0] : results;
        });
};