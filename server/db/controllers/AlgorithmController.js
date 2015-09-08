var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var CategoryController = require('./MeasurementCategoryController');
var defined = agquire('ag/utils/defined');
var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');

var prepareQuery = function(params, next) {

    var Algorithm = orm.model("Algorithm");
    if (params && params.where && defined(params.where.categoryId)) {
        params.where.measurementCategoryId = params.where.categoryId;
        delete params.where.categoryId;
    }

    return next(Algorithm, params);
};

/*
 * valid params:
 * - categoryId
 * - include: [category]
 *
 */
exports.getAlgorithms = function(params) {

    return prepareQuery(params, function(Algorithm, query) {
        return helpers.findAll(Algorithm, query);
    });
};

exports.getAlgorithm = function(userQuery) {

    var query = helpers.createParamsForIdIfRequired(userQuery);
    return prepareQuery(query, function(Algorithm, query) {
        return helpers.findOne(Algorithm, query);
    });

};

exports.findAlgorithmByName = function(name) {
    return exports.getAlgorithm({where: {name: name}});
};

var createAlgorithm = function(catID, algorithmName){

    var Algorithm = orm.model("Algorithm");
    return helpers.findOrCreateEntityOnly(Algorithm,{name:algorithmName, measurementCategoryId: catID});
};

exports.removeAlgorithm = function(userQuery, callback, authCallback) {

    var query = helpers.createParamsForIdIfRequired(userQuery);
    return prepareQuery(query, function(Algorithm, query) {
        return helpers.removeOne(Algorithm, query, authCallback);
    });
};

exports.updateAlgorithm = function (userQuery, algorithmDetails, callback, authCallback){

    var query = helpers.createParamsForIdIfRequired(userQuery);
    return prepareQuery(query, function(Algorithm, query) {
        return helpers.updateOne(Algorithm, query, authCallback, function(algorithm) {
            if(defined(algorithmDetails.name)) {
                algorithm.name = algorithmDetails.name;
            }
            if (algorithmDetails.measurementCategoryId) {
                algorithm.measurementCategoryId = algorithmDetails.measurementCategoryId;
            }
        });
    });
};

exports.createMultipleAlgorithms = function(algorithms) {

    var createAlgorithms = function() {
        return Promise.promiseForArray(algorithms, function(algorithm) {
            return createAlgorithm(algorithm.measurementCategoryId, algorithm.name);
        });
    };


    return Promise.promiseForArray(algorithms,
        function(algorithm) {
            if (algorithm.measurementCategoryId) {
                // use specific id
            } else if (algorithm.measurementCategoryName) {
                return CategoryController.createMeasurementCategory(algorithm.measurementCategoryName);
            } else {
                return helpers.rejectWithValidationError('No category information supplied for an algorithm');
            }
        }).then(function(categories) {

            var categoryMap = {};
            forEach(categories, function(category) {
                categoryMap[category.name] = category.id;
            });

            forEach(algorithms, function (algorithm) {
                if (algorithm.measurementCategoryName) {

                    var categoryId = categoryMap[algorithm.measurementCategoryName];

                    if (! categoryId) {
                        return helpers.rejectWithError('AlgorithmController : internal error (1)');
                    }

                    algorithm.measurementCategoryId = categoryId;
                }
            });

            return createAlgorithms();
        });
};

exports.createAlgorithm = createAlgorithm;
