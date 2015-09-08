var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var defined = agquire('ag/utils/defined');

var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');

/*
 * valid params:
 *  - name (name to filter by)
 *  - include: [algorithm]
 */
exports.getMeasurementCategories = function(params){

    return helpers.findAll(orm.model("MeasurementCategory"), params);
};

exports.getMeasurementCategory = function(query){

    query = helpers.createParamsForIdIfRequired(query);
    return helpers.findOne(orm.model("MeasurementCategory"), query);
};

exports.removeMeasurementCategory = function (query, authCallback) {

    //TODO: remove mongo data using that category
    query = helpers.createParamsForIdIfRequired(query);
    return helpers.removeOne(orm.model("MeasurementCategory"), query, authCallback);
};

exports.updateMeasurementCategory = function (query, categoryDetails, authCallback){

    if(! categoryDetails.name){
        return helpers.rejectWithValidationError('No name provided to update');
     }

    query = helpers.createParamsForIdIfRequired(query);
    return helpers.updateOne(orm.model("MeasurementCategory"), query, authCallback, function(category) {
       category.name = categoryDetails.name;
    });
};


/*
 * params: categoryName function(err, category)
 */
var createMeasurementCategory = function(categoryName, isSpatial){

    if(typeof categoryName !== "string"){
        return helpers.rejectWithValidationError('Invalid category name');
    }

    if(! defined(isSpatial)){
        isSpatial = false;
    }

    return helpers.findOrCreateEntityOnly(orm.model("MeasurementCategory"),
        {name: categoryName},
        {name: categoryName, isSpatial: isSpatial});
};


exports.createMultipleMeasurementCategories = function(categories) {

    return Promise.promiseForArray(categories, function(categoryDetails) {
        return createMeasurementCategory(categoryDetails.name, categoryDetails.isSpatial);
    });
};

exports.createMeasurementCategory = createMeasurementCategory;
