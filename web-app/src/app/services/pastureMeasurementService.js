/**
 * AgBase: Pasture Measurement Service
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

appServices.factory('PastureMeasurementService', function ($http, $window, $sce, $q, $log) {

    var readingsRoute = '/spatial/readings/';

    //==================================================
    //                  API functions
    //==================================================
    
    /**
     * count -                  gets a count of pasture measurements that belong to 
     *                          the paddock with an id equal to the farmId parameter.
     * 
     * @param paddockId         id of paddock
     * @param algorithmId       id of pasture measurements collection algorithm
     * @param startDate         earliest date of pasture measurements to return
     * @param endDate           latest date of pasture measurements to return
     */
    var count = function(paddockId, algorithmId, startDate, endDate) {
      
        var getOptions = { params: {} };
        
        if(paddockId) { // TODO: might be better to return if a paddock id         
            getOptions.params.paddock = paddockId;
        }
        
        if(startDate) {            
            getOptions.params.start_date = startDate;
        }
        
        if(endDate) {
            getOptions.params.end_date = endDate;
        }
        
        if(algorithmId) {         
            getOptions.params.algorithm_id = algorithmId;            
        }
            
        return $http.get(options.api.base_url + readingsRoute + 'count/', getOptions)
        .then(function(result) {
            
            if(!result.data) {
                return $q.reject(result);
            }
            return result.measurements;
        });
    };
    
    var formatMeasurement = function(measurement) {
        
        return {
            id: measurement._id,
            paddock_id: measurement.paddock_oid,
            algorithm_id: measurement.algorithm_id,
            latitude: measurement.location['1'],
            longitude: measurement.location['0'],
            altitude: measurement.altitude,
            length: measurement.length,
            created: measurement.created,
            details: createMeasurementDetails(measurement)
        };
    };
    
    /**
     * Finds all pasture measurements that belong to a paddock
     * @param paddockId     The id of the paddock to search (required).
     * @param algorithmId   The id of the algorithm type used to take the pasture 
     *                      measurements.
     * @param limit         The total amount of records to retrieve.  The API can
     *                      return a maximum of 1000 records.
     * @param offset        The first record to start returning pasture measurements from.
     */
    var find = function(paddockId, algorithmId, limit, offset, callback) {

        if(!paddockId){
            callback(new Error("Paddock Id cannot be null"), null);
            $log.debug("A paddock ID must be supplied when requesting readings");
            return;
        }      
        
        var getOptions = { params: {} };

        if(paddockId) { // TODO: might be better to return if a paddock id         
            getOptions.params.paddock = paddockId;
        }        
        if(algorithmId) {         
            getOptions.params.algorithm_id = algorithmId;            
        }
        
        if(offset) {
            getOptions.params.offset = offset;
        }
        
        if(limit) {
            getOptions.params.limit = limit;
        }
        
        $http.get(options.api.base_url + readingsRoute, getOptions).success(function(res){
            
            var measurements = [];
            
            // Convert pasture measurements to a standard format.
            res.measurements.forEach(function(measurement) {
                var m = formatMeasurement(measurement);
                measurements.push(m);
            });           
            
            callback(null, measurements);

        }).error(function(data, status){

            $log.debug(status);

            callback(new Error(status), null);

        });
    };
        
    /**
     * create - add a pasture measurement/reading
     * @param length - the length of the measurement.                           (required)
     * @param paddockId - the id of the paddock where the measurement was taken.(required)
     * @param location - the location where the measurement was taken.
     *                   must be an array that includes longitude coord first   (required)
     * @param altitiude - the altitude of the pasture measurement.
     * @param created - the time that the pasture measurement was taken.
     */
    var create = function(length, paddockId, location, altitude, created) {

        // Ensure vital data is included.        
        if(length && paddockId && location) {
  
            //Add created timestamp if required.
            if(!created) {
                date = new Date().toISOString();             
            }

            var pastureMeasurement = {
                paddock_oid: paddockId,
                length: length,
                location: location,
                altitude: altitude,
                created: created   
            };

            return $http.post(options.api.base_url + readingsRoute, pastureMeasurement)
            .then(function(result) {

                if(!result.data) {
                    $log.debug(JSON.stringify(result));
                    return $q.reject(result.error);
                }
                return result.data;                
            });
        }
        else {
            return $q.reject('A new pasture measurement must include length, paddock id, and location.');
        }
    };
    
    /*
     * remove - remove a measurement category
     * @param id - id of the category to remove
     * @param callback - function(err)
     *                  - err standard js Error object
     */
    var remove = function(id, callback){

        $http['delete'](options.api.base_url + readingsRoute + id).success(function(data){

            callback(data);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status));

        });
    };
    
    /**
     * getAPIcall - Performs the get requests to retrieve pasture measurements
     *             from the AgBase server's API.
     *                         
     * @param getOptions The query parameters of the API call.  limit MUST be 
     *                   defined in getOptions before calling this function.
     * @param repeat     A boolean used to indicate if this function should be 
     *                   recursively called if the API call returns the maximum 
     *                   number of pasture measurements. This is used when the
     *                   service caller doesn't specify a limit.
     * @param data       An array used to store data received from the API. This
     *                   is needed when the service caller doesn't specify a limit.
     */
    function getAPICall(getOptions, repeat, data) {
        
        return $http.get(options.api.base_url + readingsRoute, getOptions)
        .then(function(result) {
            
            if(!result.data) {
                return $q.reject(result); // return when an error occurs                 
            } 
            
            result.data.measurements.forEach(function(measurement) {
                var m = formatMeasurement(measurement);
                data.push(m);
            });
            
            
            if(!repeat) { return data; } 
            
            // check if data returned from the API is less than the limit parameter.
            if (result.data.measurements.length < getOptions.params.limit) { return data; }            
            
            // if the data returned is equal to the limit parameter, make another
            // API call.
            
            // update offset parameter.
            if(!getOptions.params.offset) { getOptions.params.offset = 1024; }
            else { getOptions.params.offset += 1024; }
                
            return getAPICall(getOptions, repeat, data);           
        });
    }
    
    /**
     * findByTimespan - Gets all pasture measurements between two dates.
     * @param paddockId - id of the paddock whose pasture measurements are getting queried
     * @param startDate - the start date of the pasture measurements to return.
     * @param endDate - the end date of the pasture measurements to return.
     * @param callback - function(err)
     *                  - err standard js Error object
     */
    var findByTimespan = function(paddockId, algorithmId, startDate, endDate, offset, limit) {
      
        var getOptions = { params: {} };
        
        if(paddockId) {     
            getOptions.params.paddock = paddockId;
        }
        
        if(startDate) {            
            getOptions.params.start_date = startDate;
        }
        
        if(endDate) {
            getOptions.params.end_date = endDate;
        }
        
        if(algorithmId) {         
            getOptions.params.algorithm_id = algorithmId;            
        }
        
        if(offset) {
            getOptions.params.offset = offset;
        }
        var repeatCall = false;
        if(limit) {
            getOptions.params.limit = limit;
        }        
        else {
            getOptions.params.limit = 1023;
            repeatCall = true;
        }
        return getAPICall(getOptions ,repeatCall, []);        
    };
    
    /**
     * Updates a pasture measurement
     */
    var update = function(id, length, callback) {
      
        if(!id) { throw new Error("Pasture measurement id not found"); }
        if(!length) { throw new Error("Update length not found"); }
        
        $http.put(options.api.base_url + readingsRoute + id, {length: length})
        .success(function(res) {
           
            callback(null, res.measurement);
            
        }).error(function(data, status) {
            
            console.log(status);
            
            callback(new Error(status), null);
        });
    };
    
    //=======================================
    //             Other functions
    //=======================================
    
    var createMeasurementDetails = function(reading) {
      
        var readingDate = new Date(reading['created'].split('T')[0]);                
        var timeStr = String(readingDate.getDate() + "-" + (readingDate.getMonth() + 1) + "-" + readingDate.getFullYear());
        var titleStr = "measurement length: " + reading['length'].toString();
        titleStr += "cm\nmeasurement date: " + timeStr; 
        titleStr += "\nlatitude: " + reading['location']['1'].toString() + "\nlongitude: " + reading['location']['0'].toString();
        
        return titleStr;
    };
            
    //public functions
    return{
        find: find,
        findByTimespan: findByTimespan,
        createReadingTitle: createMeasurementDetails,
        remove: remove,
        create: create,
        update: update,
        count: count
    };
});
