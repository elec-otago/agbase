/**
 * Created by mark on 26/05/15.
 */

/**
 * AgBase: ConditionScore Service
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
 * @name ConditionScoreService
 *
 * @description
 * Service for communicating with the AgBase Measurment REST API.
 *
 */
appServices.factory('ConditionScoreService', function ($q, $sce, $log, MeasurementService, AlgorithmService){

    'use strict';

    var defaultAlgorithmName = 'DairyNZ BCS';
    var defaultAlgorithm;

    var getAlgorithm = function(){

        if(defaultAlgorithm){
            return $q.when(defaultAlgorithm);
        }

        return AlgorithmService.findByNameAsPromised(defaultAlgorithmName).then(function(algorithm){
            defaultAlgorithm = algorithm;

            $log.debug("got cs algorithm: " + algorithm.name);
           return algorithm;
        });
    };


    var addScore = function(farmId, vid, herdId, score, comment){

        return getAlgorithm().then(function(algorithm){

            return MeasurementService.createSimpleNowAsPromised(null,vid, algorithm.id, farmId, herdId, score, comment).then(function(measurement){

                return measurement;

            });
        });
    };


    var getScores = function(farmId, herdId, animalId, startDate, endDate, limit, offset){

        return getAlgorithm().then(function(algorithm){

            return MeasurementService.findAsPromised(animalId,algorithm.id,herdId,farmId,startDate,endDate,limit,offset, true, false).then(function(measurements){

                return measurements;

            });
        });
    };
    
    var getScore = function(query){
        
        return getAlgorithm().then(function(algorithm){
            query.algorithmId = algorithm.id;
            return MeasurementService.findAsPromisedWithQuery(query).then(function(measurements){

                return measurements;

            });
        });
    };
    
    var getDateSet = function(query){
        
        return getAlgorithm().then(function(algorithm){
            query.algorithmId = algorithm.id;
            return MeasurementService.getSetsAsPromised(query).then(function(measurements){

                return measurements;

            });
        });
    };


    var publicAPI = {
        getAlgorithm: getAlgorithm,
        addScore: addScore,
        getScores: getScores,
        getScore: getScore,
        getDateSet:getDateSet
    };

    return publicAPI;
});