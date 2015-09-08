/**
 * AgBase: Map Service
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
appServices.factory('MapService', function($window, $sce, $log, uiGmapGoogleMapApi) {

    var DEFAULT_LATITUDE = -42;
    var DEFAULT_LONGITUDE = 174;
    var DEFAULT_ZOOM = 5;
    
    /**     
     * Creates and returns map object for use by ui-gmap-google-map
     * 
     * @param lat The center latitude
     * @param lon The center longitude
     * @param zoom The initial map zoom
     * 
     */
    var createMap = function(lat, lon, zoom) {
        
        if(!lat) {
         
            lat = DEFAULT_LATITUDE;
        }
        if(!lon) {
            
            lon = DEFAULT_LONGITUDE;
        }
        if(!zoom){
            
            zoom = DEFAULT_ZOOM;
        }
        
        var map = {
            center: {latitude: lat, longitude: lon },
            zoom: zoom,
            mapMarkers: [],
            googleMap: {},
            mapEvents: {             
                tilesloaded: function(map) {
                    google.maps.event.trigger(map, "resize");
                }
            },
            markerEvents: {}
        };
        return map;
    };

    
    /**
     * Creates and returns an object containing a map marker to display
     * the area of a paddock on a map.
     * 
     * @param lat The marker coordinates latitude
     * @param lon The marker coordinates longitude
     * @param markerId The id value used by the map marker.
     * TODO: seperate map and polygon marker?    
     */
    var createPaddockMarkers = function(lat, lon, markerId) {
    
        var mapMarker = {
            id: markerId,
            position: {
                latitude: lat,
                longitude: lon
            },
            options: {
                draggable: true
            }
        };        
        var polygonMarker = mapMarker.position;
        
        return {
            mapMarker: mapMarker,
            polygonMarker: polygonMarker
        };
    };
    
    /**
     * Creates and returns an object containing a map marker to display
     * a spatial reading on a map.
     * @param measurement The measurement object to make a marker for
     * @param lat The marker coordinates latitude
     * @param lon The marker coordinates longitude
     * @param markerId The id value used by the marker.
     * @param measurementId The id value of the spatial measurement.
     * @param title The title of the marker.
     */
    var createSpatialMarker = function(measurement, markerId)  {
        
        return  {
            markerId: markerId,
            measurementId: measurement.id,
            position: {
                latitude: measurement.latitude,
                longitude: measurement.longitude
            },
            altitude: measurement.altitude,
            length: measurement.length,
            options: {
                title: measurement.details,
                visible: true
            },
            control: {}
        };
    };
            
    /**
     * Creates and returns a polygon object for use by ui-gmap-polygon.
     */
    var createMapPaddock = function() {
        
        var polygon = {
            visible: true,
            static: false,
            fill: {
                color: "#ffff00"
            },
            stroke: {
                weight: 3,
                color: "#ffff00"
            },
            polygonMarkers: [],
            addPaddockCorner: function(lat, lon) {
                this.polygonMarkers.push(new google.maps.LatLng(lat, lon));
            }
        };
        return polygon;
    };
    
    var createMapVRASection = function(id) {
      
        var polygon = {
            id: id,
            visible: true,
            static: false,
            stroke: {
                weight: 1,
                color: "#fff"
            },
            polygonMarkers: [],
            addVRACorner: function(lat, lon) {
                this.polygonMarkers.push(new google.maps.LatLng(lat, lon));
            }
        };
        return polygon;
    };
    
    /**
     * returns an array of LatLng objects in a closed loop
     * (used to calculate paddock area)
     */
    var getPath = function(polygonMarkers) {
        
        var arr = [];
        polygonMarkers.forEach(function(coords) {
        
            arr.push(new google.maps.LatLng(coords.latitude, coords.longitude));           
        });
        arr.push(
            new google.maps.LatLng(
                polygonMarkers[0].latitude,
                polygonMarkers[0].longitude
            )
        );
        return arr;
    };
    
    /**
     * Deletes a marker from map markers and vertex from a polygon array.
     * Returns the updated map markers and polygon array.
     * 
     * @param markerId The id of the marker to delete.
     * @param mapMarkerArr The array of map markers from which to delete a marker.
     * @param polygonArr The array of polygon coordinates from which to delete.
     */
    var deleteMarker = function(markerId, mapMarkerArr, polygonArr) {
    
        var count = 0;
        var isDeleted = false;
        
        while(count < mapMarkerArr.length && !isDeleted) {
        
            if(mapMarkerArr[count].id === markerId) {
            
                if(mapMarkerArr) {
                 
                    mapMarkerArr.splice(count, 1);
                }
                if(polygonArr) {
                 
                    polygonArr.splice(count, 1);
                }
            }
            count++;
        }        
        return {
            mapMarkers: mapMarkerArr,
            polygonMarkers: polygonArr
        };
    };

    /**
    /*  Creates and returns an html string used to display a spatial measurement
     * info window.
     */
    var createMarkerInfoWindow = function(marker) {
      
        return "<div>" +
            "<label>Measurement length:</label> " + marker.length + "cm<br>" +
            "<button class='btn btn-success btn-xs' ng-disabled='!farmManager' "+  
             "ng-click='editSpatialLength(" + marker.markerId + ",\"" + marker.measurementId + "\"," + 
             marker.length + ")'>" + "<span class='glyphicon glyphicon-edit'></span></button>" +
             "<button class='btn btn-danger btn-xs'  ng-disabled='!farmManager' ng-click='deleteSpatial(" + 
             marker.markerId + ",\"" + marker.measurementId + "\"," + marker.length + ")'>" +
             "<span class='glyphicon glyphicon-trash'></span></button>" +
        "</div>";
    };
    
    /**
     * Moves the position of a paddock corner so that it matches the
     * markers an updated marker position
     * 
     * @param markerId The id of the marker that has moved.
     * @param mapMarkerArr The array of map markers.  This is used to determine 
     *                     to define the paddock border corner to move, which is
     *                     acheived by comparing each marker to the markerId parameter.
     * @param polygonArr  The array of polygon orders that contain a position that should
     *                    be moved.
     */
    var moveBorder = function(markerId, mapMarkerArr, polygonArr) {
      
        var count = 0;
        var isFound = false;
        
        while(count < mapMarkerArr.length && !isFound) {
            
            if(mapMarkerArr[count].id === markerId) {
                polygonArr[count] = ({
                    latitude: mapMarkerArr[count].position.latitude, 
                    longitude: mapMarkerArr[count].position.longitude
                });
                isFound = true;
            }
            else { count++; }
        }
        return polygonArr;
    };
    
    /**
     * Creates a heat map layer.
     */
    var createHeatMapLayer = function(showHeat, heatMapOptions) {
        
        if(!heatMapOptions) {

            heatMapOptions = {};
        }

        if(!showHeat) {

            showHeat = false;   
        }

        var heatMapLayer = {
            showHeat: showHeat,            
            heatLayer: {},              // This has to be set with a callback.
            heatMapOptions: heatMapOptions,
            heatMapPoints: []
        };
        return heatMapLayer;
    };

    var createHeatMapPoint = function(lat, lon, weight, alt) {
        
        // add placeholder values if they are not given as parameters.
        if(!lat) { lat = 0; }
        if(!lon) { lon = 0; }
        if(!weight) { weight = 1; }    
        if(!alt) { alt = 0; }

        var heatMapPoint = {
            location: new google.maps.LatLng(lat, lon),
            altitude: alt,
            weight: weight
            
        };
        return heatMapPoint;
    };

    return {
        createMap: createMap,
        createPaddockMarkers: createPaddockMarkers,
        createSpatialMarker: createSpatialMarker,
        deleteMarker: deleteMarker,
        createHeatMapPoint: createHeatMapPoint,
        createMapPaddock: createMapPaddock,
        createHeatMapLayer: createHeatMapLayer,
        getPath: getPath,
        createMapVRASection: createMapVRASection,
        moveBorder: moveBorder,
        createMarkerInfoWindow: createMarkerInfoWindow
    };
});
