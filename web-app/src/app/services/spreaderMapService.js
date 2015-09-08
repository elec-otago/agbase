/**
 * AgBase: Spreader Map Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Tim Molteno, Tim Miller
 *
 **/
appServices.factory('SpreaderMapService', function($window, $sce, $q, PolygonService, $timeout) {
    'use strict';  
   
    var gridWorker = null;
    var vraMapWorker = null;
    
    var cancelGridWorker = function() {        
        gridWorker.terminate();
        gridWorker = null;
    };
    
    var cancelVRAMapWorker = function() {
        vraMapWorker.terminate();
        vraMapWorker = null;
    };
    
    
    /**
     * Converts polygon coordinates into a format usable by workers
     */
    var convertPolygon = function(polygon) {

        var newPolygon = [];
        
        polygon.forEach(function(coord) {
            newPolygon.push({lat: coord.latitude, lon: coord.longitude});
        });
        return newPolygon;
    };
       
    var calculateFromWorker = function(paddock, polygon, measurements, resMeters, totalPolygons, callback) {
        
        gridWorker = new Worker("assets/js/patches-javascript/spreaderMapWorker.js");
        vraMapWorker = new Worker("assets/js/patches-javascript/patchesWorker.js");
        
        var grid;
        var vra;
        var _polygon = convertPolygon(polygon);        
        var _paddock = JSON.parse(JSON.stringify(paddock));        
        _paddock.loc = _polygon;
        
        gridWorker.postMessage({        // This will return a grid of lat lon positions, with
                paddock: _paddock,       // each positions pasture measurement concentration.
                polygon: _polygon,
                measurements: measurements,
                resMeters: resMeters});
            
        gridWorker.onmessage = function(e) {                        
            grid = e.data;
            cancelGridWorker();
            
            vraMapWorker.postMessage({  // This will return an array of polygons in geoJSON format,
               paddock: _paddock,        // with each polygons pasture measurement concentration.
               vraMap: grid,
               polygons: totalPolygons,
               resolution: resMeters});
            
            vraMapWorker.onmessage = function(e) {                
                vra = e.data;
                cancelVRAMapWorker();
                                
                callback({vra: vra, grid: grid});
            };
        };
    };

    var cancelCalculation = function() {
        
        if(gridWorker) { cancelGridWorker();}
        if(vraMapWorker) { cancelVRAMapWorker(); }
    };

    return {
        calculateSpreaderMap: calculateFromWorker,
        cancel: cancelCalculation
    };
});