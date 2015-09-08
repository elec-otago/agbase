var Paddock = require('../models-mongo/paddock');
var Reading = require('../models-mongo/reading');
var Promise = agquire('ag/wowPromise');
var helpers = agquire('ag/db/controllers/utils/helpers');
var pagination = require('./utils/array-pagination');
var FarmController = require('./FarmController');

var MAX_RESULTS = 1000;

var countPaddocks = function(farms) {

    var query = {};
    
    if(farms) { query.farm_id = {$in: farms}; }

    return Paddock.countAsync(query)
    .then(function(count) { 

        return count;        
    });
};

/**
 * Create paddock
 */
var createPaddock = function(paddockDetails){

    var timestamp = new Date();
    
    if(!paddockDetails.name){        

        return helpers.rejectWithValidationError('No name provided for paddock');
    }

    if(!paddockDetails.farm_id){
        return helpers.rejectWithValidationError("No farm id provided for paddock");
    }

    // Check that the paddock border coordinates are valid.
    if(!paddockDetails.loc || !paddockDetails.loc.coordinates) {
        return helpers.rejectWithValidationError("No border coordinates provided for paddock");
    }
    
    if(!Array.isArray(paddockDetails.loc.coordinates) ||
       !Array.isArray(paddockDetails.loc.coordinates[0]) ||
       paddockDetails.loc.coordinates[0].length < 2 ) {

        return helpers.rejectWithValidationError("Paddock border coordinates are incorrectly formatted");
    }        
   
    if(!paddockDetails.created) {
        paddockDetails.created = timestamp;
    }
    
    if(!paddockDetails.updated) {
        paddockDetails.updated = timestamp;
    }
    
    // Check if paddock already exists before saving.
    return Paddock.findAsync({name: paddockDetails.name, farm_id: paddockDetails.farm_id}).then(function(paddocks) {

        if (paddocks.length > 0) {
            return paddocks[0];
        }

        var paddock = new Paddock(paddockDetails);

        return paddock.saveAsync().spread(function (paddock) {
            return paddock;
        });
    });
};

/**
 * Update paddock name
 * id is mongo objectid
 */
var updatePaddock = function(id, paddockDetails){

    if(!id) {
        return helpers.rejectWithValidationError("A paddock id must be provided");
    }
    
    paddockDetails.updated = new Date();
    
    return Paddock.findOneAsync({_id: id}).then(function(paddock) {
        
        if(paddockDetails.hasOwnProperty("_id")) {

            delete paddockDetails["_id"];
        }

        if(!paddock) {           
           return helpers.rejectWithNoResultError("Paddock Not Found");
        }

        return paddock.updateAsync(paddockDetails, null).then(function(res) {
           
            return Paddock.findOneAsync({_id: id});
        });        
    });
};

/**
 * Delete paddock
 */
var deletePaddock = function(id){

    // Remove all readings that belong to paddock before deleting paddock.
    return Reading.removeAsync({paddock_oid: id})
    .then(function() {        
        // Remove paddock
        return Paddock.removeAsync({_id: id});
    });
};

var getOnePaddock = function(id) {
  
    return Paddock.findOneAsync({_id: id});
};

var getPaddocks = function(includeFarms, farmIds, limit, offset) {

    var query = {};

    
    if(farmIds) {
        query.farm_id = {$in: farmIds};
    }          

    return Paddock.findAsync(query, null, {sort: {created: -1}})
    .then(function(paddocks) {
    
        paddocks = pagination.paginate(offset, limit, paddocks);
        
        if(paddocks.length > MAX_RESULTS) {
            throw new Error('Too many results');
        }
        
        if(!includeFarms) {
            return paddocks;
        }

        return Promise.promiseForArray(paddocks, function(paddock) {

            return FarmController.getFarm(paddock.farm_id)
            .then(function(farm){
                
                var updatedPaddock =                    // need to do this or else farm
                  JSON.parse(JSON.stringify(paddock));  // won't append to paddock
                updatedPaddock.farm = farm;                
                console.log(JSON.stringify(updatedPaddock));
                return updatedPaddock;
                
            },
            function(error) {
                return paddock;
            });
        });       
    });
};

/**
/* Returns the farm id of the farm that contains the paddock with the
 * paddock_id parameter
 */
var getPaddockFarm = function(paddock_id) {
    
    return Paddock.findOneAsync({_id: paddock_id})
    .then(function(paddock) {
        return paddock.farm_id;
    });
};

var createPaddocks = function(paddocks){
    return Promise.promiseForArray(paddocks, function(paddockDetails) {
        return createPaddock(paddockDetails);
    });
};

module.exports = {
    getPaddocks: getPaddocks,
    getOnePaddock: getOnePaddock,
    createPaddock: createPaddock,
    deletePaddock: deletePaddock,
    updatePaddock: updatePaddock,
    createPaddocks: createPaddocks,
    countPaddocks: countPaddocks,
    getPaddockFarm: getPaddockFarm
};