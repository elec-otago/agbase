/**
 * AgBase: Paddock Service
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
appServices.factory('PaddockService', function ($http, $window, $sce, $q, $log, uiGmapGoogleMapApi) {

    var paddocksRoute = '/spatial/paddocks/';

    //==================================================
    //                  API functions
    //==================================================
        
    /**
     * find   - Find paddocks.
     *
     * @param - farm_id: id of farm that contains paddocks.
     */
    var find = function(farmId, callback) {

        //append farmId to query.
        var query = "?farm_id=";

        $http.get(options.api.base_url + paddocksRoute + query + farmId).success(function(res){

            // Convert paddock location coordinates to a format usable by google maps.
            
            res.paddocks.forEach(function(paddock) {
               
                if(paddock.loc.coordinates) {
                
                    paddock.loc = convertGeoJsonPolygonToMapCoords(paddock.loc.coordinates[0]);
                }
            });
            
            callback(null, res.paddocks);

        }).error(function(data, status){

            $log.debug(status);

            callback(new Error(status), null);

        });
    };
    
    /*
     * findAll   - Find all paddocks.
     */
    var findAll = function(includeFarm, callback) {

        var getOptions = { params: {} };

        if(includeFarm) {
            getOptions.params.include = "farm";
            getOptions.params.limit = "1000";
        }

        $http.get(options.api.base_url + paddocksRoute, getOptions).success(function(res){

            // Convert paddock location coordinates to a format usable by google maps.
            
            res.paddocks.forEach(function(paddock) {
               
                if(paddock.loc.coordinates) {
                    
                    paddock.loc = convertGeoJsonPolygonToMapCoords(paddock.loc.coordinates[0]);
                }
            });
            
            callback(null, res.paddocks);

        }).error(function(data, status){

            callback(new Error(status), null);

        });
    };

    /*
     * create - add a paddock
     * @param name - name of the paddock to create
     * @param farmId - id of the farm for the paddock to go in
     * @param callback - function(err, paddock)
     *                 - err standard js Error object
     *                 - paddock that has been created
     */
    var create = function(name, farmId, border, callback){
        var paddockBounds = convertMapCoordsToGeoJsonPolygon(border);
        var paddockDetails = {
            name: name, 
            farm_id: farmId, 
            loc: paddockBounds};

        $http.post(options.api.base_url + paddocksRoute, paddockDetails).success(function(res){
            // TODO convertGeoJsonPolygonToMapCoords before returning
            callback(null, res.paddock);

        }).error(function(data, status) {

            $log.debug(status);

            callback(new Error(status), null);

        });
    };
    
    /**
     * remove - remove a paddock
     * @param paddockId - id of the paddock to remove
     * @param callback - function(err)
     *                  - err standard js Error object
     */
    var remove = function(paddockId, callback){

        $http['delete'](options.api.base_url + paddocksRoute + paddockId).success(function(res){

            callback(null, res);

        }).error(function(data, status){

            $log.debug(status);
            
            callback(new Error(status));
        });
    };
    
    /**
     * count -          gets a count of paddocks that belong to the farm with an id equal 
     *                  to the farmId parameter.
     * 
     * @param farmId    id of farm
     */
    var count = function(farmId) {
        
        var getOptions = { params: {} };
        
        if(farmId) {
            getOptions.params.farm_id = farmId;
        }
        
        return $http.get(options.api.base_url + paddocksRoute +  'count/', getOptions)
        .then(function(result) {
            if(!result.data) {                
                return $q.reject(result);
            }
            return result.data;
        });
    };
    
    /*
     * update - update a paddock
     * @param id - paddockId id of paddock to update
     * @param callback - function(err)
     *                  - err standard js Error object
     */
    var update = function(paddock, callback){
        paddock.loc = convertMapCoordsToGeoJsonPolygon(paddock.loc);
        
        $http['put'](options.api.base_url + paddocksRoute + paddock._id, paddock).success(function(res){

            callback(null, res);

        }).error(function(data, status){

            $log.debug(status);
            $log.debug(JSON.stringify(data));

            callback(new Error(status));
        });
    };

    //=======================================
    //             Other functions
    //=======================================
    
    /**
     * Converts a set of location coordinates into a geo json format
     * for saving to the database.
     */
    var convertMapCoordsToGeoJsonPolygon = function(mapCoords) {
        var geojson = {
            type: "Polygon",
            coordinates:[]            
        };
        
        var innerCoordinates = [];
     
        mapCoords.forEach(function(coords) {
        
            innerCoordinates.push([
                    coords.longitude,
                    coords.latitude]);
        });
        
        if(mapCoords.length > 0) {
            // Close the polygon by adding the first coordinate to the end
            innerCoordinates.push([
                    mapCoords[0].longitude,
                    mapCoords[0].latitude]);
        }
        
        geojson.coordinates.push(innerCoordinates);
        return geojson;
    };
                
    /**
     * Converts a geo json polygon to a set of location
     * coordinates usable by google maps.
     */
    var convertGeoJsonPolygonToMapCoords = function(geojsonCoords) {
                
        var polygon = [];
        
        geojsonCoords.forEach(function(value) {
            
            polygon.push({latitude: value[1], longitude: value[0]});
        });
        polygon.pop(); // Remove last since it is the same as the first.
        
        return polygon;
    };
    
    
    return {
        find: find,
        findAll: findAll,
        create: create,
        update: update,
        remove: remove,
        count: count
    };
});
