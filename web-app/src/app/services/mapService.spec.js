/**
 * AgBase: Map Service Test
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller
 *
 **/
describe('MapService', function() {

    var MapService;

    beforeEach( angular.mock.module('ngMoogle') );
    
    beforeEach(inject(function(_MapService_) {
        
        MapService = _MapService_;
    }));

    it('Test createMap', function() {       

        var lat = 1;
        var lon = 1;
        var zoom = 10;
        
        var map = MapService.createMap(lat, lon, zoom);
        
        // Check that the map properties have initialzed correctly.
        expect(map.center.latitude).toEqual(lat);
        expect(map.center.longitude).toEqual(lon);
        expect(map.zoom).toEqual(zoom);
        expect(map.mapMarkers.length).toEqual(0);
        expect(map.googleMap).toBeTruthy();
        expect(typeof map.mapEvents.tilesloaded).toEqual('function');
        expect(map.markerEvents).toBeTruthy();
    });
    
    it('Test createMapPaddock', function() {
        
        var poly = MapService.createMapPaddock();
        
        // Check that polygon properties have initialized correctly.
        expect(poly.visible).toEqual(true);
        expect(poly.static).toEqual(false);
        expect(poly.fill.color).toBeTruthy();
        expect(poly.stroke.weight).toBeTruthy();
        expect(poly.stroke.color).toBeTruthy();
        expect(poly.polygonMarkers.length).toEqual(0);
    });
    
    it('Test createPaddockMarkers', function() {
    
        var lat = 1;
        var lon = 1;
        var markerId = 1;
        
        var markersObj = MapService.createPaddockMarkers(lat, lon, markerId);
        
        // Check that createMarkers returns a map and polygon marker.
        expect(markersObj.mapMarker).toBeTruthy();
        expect(markersObj.polygonMarker).toBeTruthy();
        
        if(markersObj.mapMarker && markersObj.polygonMarker) {
         
            var mMarker = markersObj.mapMarker;
            var pMarker = markersObj.polygonMarker;
            
            // Check that the map marker properties have initialized correctly.
            expect(mMarker.id).toEqual(markerId);
            expect(mMarker.position.latitude).toEqual(lat);
            expect(mMarker.position.longitude).toEqual(lon);
            
            // Check that the polygon marker properties have initialized correctly.
            expect(pMarker.latitude).toEqual(lat);
            expect(pMarker.longitude).toEqual(lon);
        }
    });
    
    it('Test createSpatialMarker', function() {
        
        var measurement = {            
            latitude: 1,
            longitude: 2,  
            altitude:  3,
            length: 4,
            details: "spatial measurement title"
        };
        var markerId = 1;
        
        var markerObj = MapService.createSpatialMarker(measurement, markerId);
        
        expect(markerObj.position.longitude).toEqual(measurement.longitude);
        expect(markerObj.position.latitude).toEqual(measurement.latitude);
        expect(markerObj.markerId).toEqual(markerId);
        expect(markerObj.options.title).toEqual(measurement.details);
    });
    
    it('Test deleteMarkers', function() {
    
        var lats = [0, 1];
        var lons = [0, 1];
        var markerId = 1;
        
        var mapMarkers = [];
        var polyMarkers = [];
        
        
        // Create array of map and polygon markers.
        lats.forEach(function(lat) {
        
            lons.forEach(function(lon) {
                
                var markers = MapService.createPaddockMarkers(lat, lon, markerId);
                
                markerId++;
                
                mapMarkers.push(markers.mapMarker);
                polyMarkers.push(markers.polygonMarker);
            });
        });
        
        var delMapMark = mapMarkers[2];
        var delPolyMark = polyMarkers[2];
        
        // Delete markers
        var updatedMarkers = MapService.deleteMarker(mapMarkers[2].id, mapMarkers, polyMarkers);
        
        // Check that map marker was deleted successfully by checking longitude.
        expect(updatedMarkers.mapMarkers[2].position.longitude !== delMapMark.position.longitude).toBeTruthy();
                        
        // Check that polygon marker was deleted successfully by checking longitude.
        expect(updatedMarkers.polygonMarkers[2].longitude !== delPolyMark.longitude).toBeTruthy();        
        
        //Check that the updated polygon marker's coordinates match the updated map marker's coordinates.
        expect(updatedMarkers.polygonMarkers[2].longitude)
        .toEqual(updatedMarkers.mapMarkers[2].position.longitude);
        
        expect(updatedMarkers.polygonMarkers[2].latitude)
        .toEqual(updatedMarkers.mapMarkers[2].position.latitude);
    });
});
