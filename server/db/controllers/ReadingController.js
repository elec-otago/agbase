/**
 * ReadingController.js 
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller.
 *
 **/

var Reading = require('../models-mongo/reading');
var Promise = agquire('ag/wowPromise');
var helpers = agquire('ag/db/controllers/utils/helpers');
var pagination = require('./utils/array-pagination');

var MAX_RESULTS = 1024; 

/**
 * Return a count of pasture measurements.
 */
var countReadings = function(paddocks, startDate, endDate, algoId) {
    var query = {};

    // Check for paddock's object id
    if(paddocks) {
        query.paddock_oid = {$in: paddocks};
    }

    // Check for algorithm id
    if(algoId) {
        query.algorithm_id = parseInt(algoId);
    }
    
    if(startDate && endDate) {
        query.created = {$gt: new Date(startDate), $lt: new Date(endDate)};
    }
    
    // Check if a start date was given
    else if(startDate) {
        query.created =  {$gt: new Date(startDate)};
    }
    
    // Check if an end date was given
    else if(endDate) {
        query.created = {$lt: new Date(endDate)};
    }
    
    return Reading.countAsync(query)
    .then(function(count) {
                        
        return count;
    });
};

/**
 * Create reading 
 */
var createReading = function(readingDetails) {

    var timestamp = new Date();
    
    if(!readingDetails.paddock_oid) {
        return helpers.rejectWithValidationError("A paddock id must be provided to create a reading");
    }
    
    if(!readingDetails.length) {
        return helpers.rejectWithValidationError("A pasture measurement length must be provided to create a reading");
    }
    
    if(!readingDetails.location) {
        return helpers.rejectWithValidationError("Location coordinates must be provided to create a reading");
    }
   
    if(readingDetails.location.length !== 2) {
        return helpers.rejectWithValidationError("Location coordinates must contain only longitude and latitude values");
    }
    if(!readingDetails.created) {
        readingDetails.created = timestamp;
    }
    if(!readingDetails.updated) {
        readingDetails.updated = timestamp;
    }
    //TODO check that location is within lat lon coordinate bounds?
    
    var reading = new Reading(readingDetails);   

    return reading.saveAsync().spread(function(reading) {
        return reading;
    });
};

/**
 * Update reading length 
 */
var updateReading = function(id, readingDetails){

    var updates = {};
    updates.length = readingDetails.length;
    readingDetails.updated = new Date();
    
    return Reading.findOneAsync({_id: id}).then(function(reading) {

        return reading.updateAsync(updates).then(function(res) {

            return Reading.findOneAsync({_id: id});
        });
    });
};

/**
 * Delete reading
 */
var deleteReading = function(id) {
    
    return Reading.removeAsync({_id: id});
};

/**
 * Get readings.
 */
var getReadings =  function(paddocks, startDate, endDate, algoId, limit, offset){

    var query = {};

    console.log("ReadingController");
    
    // Check for paddock's object id
    if(paddocks) {
        query.paddock_oid = {$in: paddocks};
    }

    // Check for algorithm id
    if(algoId) {
        query.algorithm_id = parseInt(algoId);
    }
    
    if(startDate && endDate) {
        query.created = {$gt: new Date(startDate), $lt: new Date(endDate)};
    }
    
    // Check if a start date was given
    else if(startDate) {
        query.created =  {$gt: new Date(startDate)};
    }
    
    // Check if an end date was given
    else if(endDate) {
        query.created = {$lt: new Date(endDate)};
    }
    
    return Reading.findAsync(query, null, {sort: {created: -1}})
    .then(function(readings) {
        
        updateReadings = pagination.paginate(offset, limit, readings);
        
        if(updateReadings.length > MAX_RESULTS) {
            throw new Error('Too many results');
        }
        return updateReadings;        
    });
};

/**
 * Converts a date object to total minutes sinch Epoch
 */
var toMinutes = function(date) {
    return Math.floor(date.getTime() / 6000);
}

var getSetDates = function(params) {

    var query = {};
        
    if(params.paddock) {
        // add paddock id to query
        query.paddock_oid = params.paddock;
    }
    if(params.algorithm) {
        // add algorithm id to query
        query.algorithm_id = params.algorithm;
    }       
        
    return Reading.findAsync(query, null, {sort: {created: -1}})
    .then (function(readings) {
       
        var set = {        
            start: null,
            end: null,
            count: 0
        }
    
        if(readings.length > 0) {
            
            var window = 60; // max number of minutes between measurements
            if(params.window) {
                // add window to query
                window = Math.min(params.window, 1440);
            }
                
            var curDate;
            var lastDate = new Date(readings[0].created);
            var indx = 2; // point to look at in readings array
            
            // perform initial setup on set
            set.count++;
            set.start = lastDate.toISOString();
            set.end = lastDate.toISOString();
            
            if(readings.length === 1) {
                return set;
            }
            curDate = new Date(readings[1].created);
            
            while(toMinutes(lastDate) - toMinutes(curDate) <= window && indx < readings.length){
            
                lastDate = curDate;
                curDate = new Date(readings[indx].created);
                indx++;
                 
                set.start = lastDate.toISOString();
                set.count++;
            }
        }
        return set;
    });
};

/**
 * Create many readings
 */
var createReadings = function(readings){
    return Promise.promiseForArray(readings, function(readingDetails) {
        return createReading(readingDetails);
    });
};

module.exports = {
    createReading: createReading,
    updateReading: updateReading,
    getReadings: getReadings,
    deleteReading: deleteReading,
    createReadings: createReadings,
    countReadings: countReadings,
    getSetDates: getSetDates
};