/**
 * AgBase: Measurement Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 * @ngdoc service
 * @name MeasurementService
 *
 * @description
 * Service for communicating with the AgBase Measurment REST API.
 *
 */
appServices.factory('MeasurementService', function ($http, $window, $sce, $q, $log) {

    'use strict';
    var measurementRoute = '/measurements/';

    /**
     * @callback getMeasurementsCallback
     * @param {Object} error standard js Error
     * @param {Object[]} measurements array of measurements
     */

    /**
     * @ngdoc function
     * @name findForAnimal
     *
     * @description
     * Find all Measurements for a animal
     *
     * @param {Number} animalId The id of the animal to filter measurements by
     * @param {getMeasurementsCallback} callback The callback function that is called when the request is completed
     */
    var findForAnimal = function(animalId, callback) {

        $http.get(options.api.base_url + measurementRoute + "?animal=" + animalId).success(function(data){

            callback(null, data.measurements);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };

    function findAPICall(getOptions, repeat, data) {
        
        return $http.get(options.api.base_url + measurementRoute, getOptions)
        .then(function(result) {
                       
            if(!result.data.measurements) { 
                return $q.reject(result); // return when an error occurs                 
            } 
            if(!repeat) { 
                return result.data.measurements;   // return when not repeating the API call              
            } 
            
            // check if data returned from the API is less than the limit parameter.
            else if (result.data.measurements.length < getOptions.params.limit) {                
                
                if(!data) {             // if data array, has not been defined then
                    return result.data.measurements; // return response from API.
                }                       // otherwise, put data from API into               
                else {                  // data array before returning it              
                    result.data.measurements.forEach(function(value) { 
                        data.push(value);                         
                    });
                    return data;
                }
            }
            // if the data returned is equal to the limit parameter, make another
            // API call.
            else {      
                // put pasture measurements recieved from the API into data array.
                if(!data) { 
                    data = result.data.measurements;                    
                }
                else {
                    result.data.measurements.forEach(function(value) { data.push(value); } );
                }
                // set the offset parameter.
                if(!getOptions.params.offset) { getOptions.params.offset = 1023; }
                else { getOptions.params.offset += 1023; }
                
                return findAPICall(getOptions, repeat, data);
            }
        });        
    }

    //use findAsPromised instead
    var find = function(animalId, algorithmId, herdId, farmId, startDate, endDate, 
                        includeAnimal, includeAlgorithm, offset, limit) {//, timeout){

        var getOptions = createGetOptions();

        addParamIfExists(getOptions,'animal',animalId);
        addParamIfExists(getOptions,'algorithm',algorithmId);
        addParamIfExists(getOptions,'herd',herdId);
        addParamIfExists(getOptions,'farm',farmId);
        addParamIfExists(getOptions,'startDate',startDate);
        addParamIfExists(getOptions,'endDate', endDate);
        addParamIfExists(getOptions, 'offset', offset);

        addIncludeIfShould(getOptions,'animal', includeAnimal);
        addIncludeIfShould(getOptions,'algorithm', includeAlgorithm);
        
     //   if(timeout) { getOptions.timeout = timeout.promise; }
            
        var repeatCall = false;
        if(limit) {
            getOptions.params.limit = limit;
        }
        else {
            getOptions.params.limit = 1023;
            repeatCall = true;
        }
        
        return findAPICall(getOptions, repeatCall);
    };

    function createGetOptions(){
        return { params: {} };
    }

    function addParamIfExists(getOptions,newParamName,newParam){
        if(newParam){
            getOptions.params[newParamName] = newParam;
        }
    }

    function addIncludeIfShould(getOptions, name, should){
        if (! should){
            return;
        }

        if(! getOptions.params.include){
            getOptions.params.include = [];
        }

        getOptions.params.include.push(name);
    }

    var findAsPromised = function(animalId, algorithmId, herdId, farmId, startDate, endDate, limit, offset, includeAnimal, includeAlgorithm){

        var getOptions = createGetOptions();

        addParamIfExists(getOptions,'animal',animalId);
        addParamIfExists(getOptions,'algorithm',algorithmId);
        addParamIfExists(getOptions,'herd',herdId);
        addParamIfExists(getOptions,'farm',farmId);
        addParamIfExists(getOptions,'startDate',startDate);
        addParamIfExists(getOptions,'endDate', endDate);
        addParamIfExists(getOptions, 'limit', limit); 
        addParamIfExists(getOptions, 'offset', offset);

        addIncludeIfShould(getOptions,'animal', includeAnimal);
        addIncludeIfShould(getOptions,'algorithm', includeAlgorithm);

        $log.debug(options.api.base_url + measurementRoute + JSON.stringify(getOptions));

        return $http.get(options.api.base_url + measurementRoute, getOptions).then(function(result){

            if(! result.data.measurements || result.data.measurements.length === 0){
                return $q.reject('No Measurements Found');
            }

            return result.data.measurements;
        });
    };
    
    var findAsPromisedWithQuery = function(query){
        if(!query.limit){
            query.limit = 1000;
        }

        var getOptions = { params: query };
        return $http.get(options.api.base_url + measurementRoute, getOptions).then(function(result){

            if(! result.data.measurements || result.data.measurements.length === 0){
                return $q.reject('No Measurements Found');
            }

            return result.data.measurements;
        });
    };
    
    var getCountAsPromised = function(query){

        var  reqOptions = {params: query};

        return $http.get(options.api.base_url + measurementRoute + "count", reqOptions).then(function(result){

            return result.data.count;
        });
    };
    
    var getSetsAsPromised = function(query){

        var  reqOptions = {params: query};

        return $http.get(options.api.base_url + measurementRoute + "sets", reqOptions).then(function(result){

            return result.data;
        });
    };


    /**
     * @ngdoc function
     * @name remove
     * remove - remove a measurement
     * @param {String} id id of the measurement to remove
     * @param {function} callback function(err)
     *                  - err standard js Error object
     */
    var remove = function(id, callback){

        $http['delete'](options.api.base_url + measurementRoute + id).success(function(data){

            callback(null);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status));

        });
    };


    /**
     * @ngdoc function
     * @name createAnimalAndMeasurement
     * @description
     * create a measurement and the specified animal if it does not already exist
     * 
     * @param {String} eid eid of the animal for the new measurement
     * @param {String} vid vid of the animal, either eid or vid must be supplied
     * @param {Number} farmId farmId of the animal that this measurement is for
     * @param {Number} [herdId] optional id for the herd the newly created animal should go into
     * @param {Number} algorithmId - compulsory id for algorithm this measurement is made with
     * @param {Object} measurement -
     *                      w05: <decimal>
     *                      w25: <decimal>
     *                      w50: <decimal>
     *                      w75: <decimal>
     *                      w95: <decimal>
     *                   timeStamp: <date of measurement>
     *                     comment: <comment string>
     *
     * @param {getMeasurementsCallback} callback The callback function that is called when the request is completed
     */
    var createAnimalAndMeasurement = function(eid, vid, farmId, herdId, algorithmId, measurement, callback){

      
        //console.log(measurement);
        var measurementDetails = measurement;
        
        
        measurementDetails.farmId =  farmId;
        measurementDetails.algorithmId = algorithmId;

        if(herdId) {
            measurementDetails.herdId = herdId;
        }

        if(vid) {
            measurementDetails.vid = vid;
        }

        if(eid){
            measurementDetails.eid = eid;
        }
        console.log(measurementDetails);
        $http.post(options.api.base_url + measurementRoute, measurementDetails).success(function(data){

            callback(null, data.measurement);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    /**
     * @ngdoc function
     * @name create
     * @description 
     * create a measurement for a specified animal
     * @param {Number} animalId - id of the animal for the new measurement
     * @param {Number} algorithmId - id for algorithm this measurement is made with
     * @param {Object} measurement -
     *                      w05: <decimal>
     *                      w25: <decimal>
     *                      w50: <decimal>
     *                      w75: <decimal>
     *                      w95: <decimal>
     *                   timeStamp: <date of measurement>
     *                     comment: <comment string>
     *
     * @param {getMeasurementsCallback} callback The callback function that is called when the request is completed
     */
    var create = function(animalId, algorithmId, measurement, callback){

        var measurementDetails = measurement;

        measurementDetails.algorithmId = algorithmId;

        $http.post(options.api.base_url + measurementRoute, measurementDetails).success(function(data){

            callback(null, data.measurement);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });

    };


    /**
     * @ngdoc function
     * @name createMultiple
     * @description 
     * create multiple measurements for a specified animal
     * @param {Number} animalId - id of the animal for the new measurement
     * @param {Number} algorithmId - id for algorithm this measurement is made with
     * @param {Array} measurements, array of measurement -
     *                      w05: <decimal>
     *                      w25: <decimal>
     *                      w50: <decimal>
     *                      w75: <decimal>
     *                      w95: <decimal>
     *                   timeStamp: <date of measurement>
     *                     comment: <comment string>
     *
     * @param {getMeasurementsCallback} callback The callback function that is called when the request is completed
     */
    var createMultiple = function(animalId, algorithmId, measurements, callback){
        // IMPORTANT
        // You can use eid/vid instead of animalId, and if you do then they go
        // at the same level as animalId. Don't include them with measurements.
        // You should also send farmId if you plan on using eid/vid.

        var body = {animalId: animalId, algorithmId: algorithmId, measurements: measurements};

        $http.post(options.api.base_url + measurementRoute, body).success(function(data){

            callback(null, data.measurements);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };

    /**
     * @ngdoc function
     * @name createMultipleConditionScores
     * @description 
     * Upload a days worth of condition scores. 
     * @param {Number} algorithmId - id for algorithm these condition scores is made with
     * @param {Number} farmId - id of the farm these condition scores belong to. 
     * @param {Number} herdOd - id of the herd these condition scores belong to.
     * @param {Array} measurements, array of measurement -
     *                      vid: <string>      
     *                      w05: <decimal>
     *                      w25: <decimal>
     *                      w50: <decimal>
     *                      w75: <decimal>
     *                      w95: <decimal>
     *                      timeStamp: <date of measurement>
     *
     * @param {getMeasurementsCallback} callback The callback function that is called when the request is completed
     */
    var createMultipleConditionScores = function(algorithmId, farmId, herdId, measurements, callback){
        
        // add herd id to each measurement if it exists
        //TODO adding herd id to each measurements breaks the API.
        
        if(herdId) { 
            measurements.forEach(function(measurement) {
                measurement.herdId = herdId;
            });
        }
        
        var body = {algorithmId: algorithmId, farmId: farmId, measurements: measurements};
        
        $http.post(options.api.base_url + measurementRoute, body).success(function(data){

            callback(null, data.measurements);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };
    
    
    /**
     * createSimple - create a single value measurement for a specified animal
     * @param animalId - id of the animal for the new measurement
     * @param algorithmId - id for algorithm this measurement is made with
     * @param measurementValue - value for the measurement
     * @param timeStamp - timeStamp for the measurement
     *
     * @param {getMeasurementsCallback} callback The callback function that is called when the request is completed
     */
    var createSimple = function(animalId, algorithmId, measurementValue, timeStamp, callback){

        var measurementDetails = {animalId: animalId, algorithmId:algorithmId, w50: measurementValue, timeStamp: timeStamp};

        $http.post(options.api.base_url + measurementRoute, measurementDetails).success(function(data){

            callback(null, data.measurement);

        }).error(function(data, status){

            console.log(status);

            callback(new Error(status), null);

        });
    };


    var createSimpleNowAsPromised = function(eid, vid, algorithmId, farmId, herdId, measurementValue, comment){

        var measurementDetails = {w50: measurementValue, timeStamp: Math.floor(Date.now() / 1000), comment: comment};

        measurementDetails.farmId =  farmId;
        measurementDetails.algorithmId = algorithmId;

        if(herdId) {
            measurementDetails.herdId = herdId;
        }

        if(vid) {
            measurementDetails.vid = vid;
        }

        if(eid){
            measurementDetails.eid = eid;
        }
        console.log(measurementDetails);

        return $http.post(options.api.base_url + measurementRoute, measurementDetails).then(function(result){


            if(! result.data.measurement){
                return $q.reject("Measurement was not created!");
            }

            return result.data.measurement;

        }, function(err){

            console.log(err);
        });
    };

    //public functions
    return{
        findForAnimal: findForAnimal,
        remove: remove,
        createAnimalAndMeasurement: createAnimalAndMeasurement,
        create: create,
        createMultiple: createMultiple,
        createMultipleConditionScores: createMultipleConditionScores,
        createSimple: createSimple,
        createSimpleNowAsPromised: createSimpleNowAsPromised,
        find: find,
        findAsPromised: findAsPromised,
        findAsPromisedWithQuery: findAsPromisedWithQuery,
        getCountAsPromised: getCountAsPromised,
        getSetsAsPromised: getSetsAsPromised
    };

});