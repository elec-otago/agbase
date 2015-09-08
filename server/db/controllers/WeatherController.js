var Weather = require('../models-mongo/weather');
var pagination = require('./utils/array-pagination');

var MAX_RESULTS = 1000; 
/**
 * Create weather measurement
 */
var createReading = function(readingDetails, callback) {

    if(!readingDetails.farm_id) {

        callback(new Error("A farm id must be provided"), null);
        return;
    }
    else if(!readingDetails.location) {

        callback(new Error("Location coordinates must be provided"), null);
        return;
    }    
    else if(readingDetails.location.length != 2) {

        callback(new Error("Location coordinates must contain only longitude and latitude values"), null);
        return;
    }
    // check latitude value
    if(readingDetails.location[1] > 90 || readingDetails.location[1] < -90) {
    
        callback(new Error("Location coordinates must not be outside latitude bounds"), null);
        return;
    }
    // check longitude value
    if(readingDetails.location[0] > 180 || readingDetails.location[0] < -180) {

        callback(new Error("Location coordinates must not be outside longitude bounds"), null);
        return;
    }
    
    // add a timestamp if none is provided TODO: maybe just throwing an error is a better option.
    if(!readingDetails.created) {

        readingDetails.created = new Date();
    }

    var weather = new Weather(readingDetails);

    weather.save(function(err) {

        if(err) {

            callback(err, null);
        }
        else {

            callback(null, weather);
        };
    });
    
};

// Checks that a proposed location updated is within valid lat/lon coordinates
// TODO: delete this if location updates get disabled
var checkWithinCoords = function(location) {

    return location && location.length === 2
        && location[1] <= 90 && location[1] >= -90
        && location[0] <= 180 && location[0] >= -180
};

/**
 * Update weather measurement
 */
var updateReading = function(readingId, readingDetails, callback) {

    var _id = readingId;
    var update = {};

    // find update fields...
    if(readingDetails.temperature) {
        update.temperature = readingDetails.temperature;
    }
    if(readingDetails.altitude) {
        update.altitude = readingDetails.altitude;
    }
    if(checkWithinCoords(readingDetails.location)) {
        update.location = readingDetails.location;
    }    

    Weather.findOne({_id: _id}, function(err, reading) {

        if(!reading || err) {
            callback(new Error("Weather measurement not found"), null);
        }
        else {
            console.log("found one!");
            reading.update(update, null, function(err, updated) {

                if(err) {
                    callback(err, null);
                }
                else {
                    console.log("updated");
                    getReadings(null, null, null, readingId, function(err, res){
                        
                        if(res && res.length === 1) {
                        
                            callback(null, res[0]);
                        }
                        else {
                            // following line should only execute when the database becomes
                            // unavailable after reading.update
                            callback(new Error("Weather measurement not found"), null);
                        }
                    });
                    
                }
            });
        }
    });
};

/**
 * Delete weather measurement
 */
var deleteReading = function(readingId, callback) {

    var _id = readingId;

    Weather.remove({_id: _id}, function(err) {

        if(err) {
            callback(err);
        }
        else {
            callback(null);
        }
    });
};

/**
 * Get weather measurements
 */
var getReadings = function(farms, startDate, endDate, limit, offset, callback) {

    var query = {};
   
    if(farms) {
        query.farm_id = {$in: farms};
    }
    if(startDate && endDate) {
        query.created = {$gte: new Date(startDate), $lte: new Date(endDate)};
    }
    else if(startDate) {
        query.created = {$gte: new Date(startDate)};
    }
    else if(endDate) {
        query.created = {$lte: new Date(endDate)};
    }
 
    Weather.find(query).sort({created: -1}).exec(function(err,readings) {
        
        if(err) {
            callback(err, null);
        }
        else {
           
            readings = pagination.paginate(offset, limit, readings);
            
            if(readings.length > MAX_RESULTS) {

                var e =  new Error('Too many results');

                callback(e, null);
            }
            else {
                callback(null, readings);
            }
        }
    });
};

module.exports = {
    createReading: createReading,
    updateReading: updateReading,
    getReadings: getReadings,
    deleteReading: deleteReading
};