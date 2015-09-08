/**
 * AgBase: Pasture Analysis Tool
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

var module = angular.module( 'ngMoogle.reports.pastureAnalysis', [
    'ui.router', 
    'ngSanitize', 
    'ngCsv',
    'uiGmapgoogle-maps'
])
.factory('Channel', function(){

    return function () {

        var callbacks = [];

        this.add = function (cb) {
            
            callbacks.push(cb);
        };

        this.invoke = function () {

            var args = arguments;

            callbacks.forEach(function (cb) {

                cb.apply(undefined,args);
            });
        };
        return this;
    };
})
.service('toggleMeasurementsChannel',['Channel',function(Channel) {
    return new Channel();
}])
.service('togglePaddockChannel',['Channel',function(Channel) {
    return new Channel();
}])
.service('toggleHeatMapChannel',['Channel',function(Channel) {
    return new Channel();
}])
.service('toggleVRAMapChannel', ['Channel',function(Channel) {
    return new Channel();
}]);

module.config(function config( $stateProvider, uiGmapGoogleMapApiProvider) {
    $stateProvider.state( 'home.reports.pastureAnalysis', {
        url: "/pasture-analysis",
        views: {
            "report-content": {
                controller: 'pastureAnalysisReportCtrl',
                templateUrl: 'reports/pastureAnalysis/pastureAnalysis.tpl.html'
            }
        },
        data:{ pageTitle: 'Pasture Analysis' }
    });
    
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBMKg5EP-e9KEbsPtIlotV1NIz6eWBguCY',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

/**
 * Resolution meter object.
 */
function MetersResolution(value) {
    
    this.value = value;
    this.display = this.value + "m";
}

/**
 * csv line object.
 */
function MapCsv(lat, lon, alt, concentration) {
 
    this.a = lat;
    this.b = lon;
    this.c = alt;
    this.d = concentration;
    
    //loadVRAMapPoint sets this objects properties 
    // from an existing vra map point object.
    this.loadVRAMapPoint = function(vraMapPoint) {
      
        this.a = vraMapPoint.location.lat();
        this.b = vraMapPoint.location.lng();
        this.c = vraMapPoint.altitude;
        this.d = vraMapPoint.weight;
    };
    
    // Returns this objects properties in a format usable 
    // by ngCsv to generate a csv file.
    this.getCsv = function() {
        return {a: String(this.a), b: String(this.b), c: String(this.c), d: String(this.d)};
    };
}

// Display Layers map controller.
module.controller('layerToggleCtrl', function LayerToggleController($scope, 
    toggleMeasurementsChannel, togglePaddockChannel, toggleHeatMapChannel, toggleVRAMapChannel) {

    angular.extend($scope, {
        
        togglePastureMeasurements: function() {
            
            toggleMeasurementsChannel.invoke($scope.cbToggleMeasurements);
        },
        togglePaddockBorder: function() {
            
            togglePaddockChannel.invoke($scope.cbTogglePaddock);
        },
        toggleHeatMap: function() {
            
            toggleHeatMapChannel.invoke($scope.cbToggleHeatMap);
        },
        toggleVRAMap: function() {
            
            toggleVRAMapChannel.invoke($scope.cbToggleVRAMap);
        }
    });
});

module.controller( 'pastureAnalysisReportCtrl', function PastureAnalysisReportController( 
    $scope, $state, FarmService, PaddockService, PastureMeasurementService, SpreaderMapService, UserPreferencesService,
    MapService, uiGmapIsReady, $stateParams, $sce,$log, uiGmapGoogleMapApi,PolygonService, $timeout, $q,
    toggleMeasurementsChannel, togglePaddockChannel, toggleHeatMapChannel, toggleVRAMapChannel) {
    
    toggleMeasurementsChannel.add(function(args) {

        $scope.togglePastureMeasurements(args);       
    });
    togglePaddockChannel.add(function(args) {

        $scope.togglePaddockBorder(args);
    });
    toggleHeatMapChannel.add(function(args) {

        $scope.toggleHeatMap(args);
    });
    toggleVRAMapChannel.add(function(args) {
       
        $scope.toggleVRAmap(args);
    });
    
    // Feedback messages displayed in Calculate VRA Map dialog.
    var CALC_VRA_MAP = "Calculating VRA map...";
    var REND_VRA_MAP = "Rendering VRA map...";
    
    $scope.fileName = "vra_map";
    $scope.csvFileHeader = ['lat', 'lon', 'alt', 'concentration'];
    
    $scope.state = $state;
            
    $scope.vraMapCalculating = false;   // Flag used to disable the calculate button in the 
                                        // calculate VRA map dialog(to prevent breakage via 
    $scope.resolutions = [              // spam clicking).
        new MetersResolution(1),
        new MetersResolution(2),
        new MetersResolution(5),
        new MetersResolution(10),
        new MetersResolution(15),
        new MetersResolution(20),
        new MetersResolution(30),
        new MetersResolution(50),
        new MetersResolution(100)
    ];            // Resolution in meters for vra map.

    // Google map               
    $scope.map = MapService.createMap();
    // VRA map
    $scope.map.vraMapPolygons = [];
    $scope.map.visibleVRAMap = true;
    // pasture measurement visibility    
    $scope.mapMarkersVisible = true; 
    // Heat map layer
    var vraMapVisible = true;                                                   
    $scope.map.vraMapLayer = MapService.createHeatMapLayer(vraMapVisible, null);        
    $scope.map.vraMapLayer.heatLayerCallback = function(layer) {

        $scope.map.vraMapLayer.heatLayer = layer;
    };

    // selected paddock
    $scope.paddock = MapService.createMapPaddock();
   
    $scope.import = {};
    
    /**
     * Displays the selected start date when a start date is clicked
     * in the start calendar.
     */
    $scope.onStartDateSet = function(newDate, oldDate) {

        $("#startDateDisplay").val($scope.formatDate(newDate));
        $scope.beginDate = new Date(newDate);
    };
    /**
     * Displays the selected end date when an end date is clicked
     * in the end date calendar.
     */
    $scope.onEndDateSet = function(newDate, oldDate) {

        $("#endDateDisplay").val($scope.formatDate(newDate));
        $scope.lastDate = new Date(newDate);
    };

    // this exists only for testing purposes
    $scope.PastureMeasurement = function(lat, lon, alt, length){
        return new PastureMeasurement(lat,lon,alt, length);
    };

    /**
     * Toggles the display of the pasture measurement markers.
     */
    $scope.togglePastureMeasurements = function(isVisible) {
        
        $scope.mapMarkersVisible = isVisible;
        
        $scope.map.mapMarkers.forEach(function(value) {

            value.options.visible = isVisible;
        });
    };

    /**
     * Toggles the display of the selected paddock borders.
     */
    $scope.togglePaddockBorder = function(isVisible) { $scope.paddock.visible = isVisible; };

    /**
     * Toggles the display of the heat map.
     */
    $scope.toggleHeatMap = function(isVisible) {

        $scope.map.vraMapLayer.showHeat = isVisible;
    };

    /**
     * Toggles the display of the VRA map.
     */
    $scope.toggleVRAmap = function(isVisible){

        $scope.map.visibleVRAMap = isVisible;       
    };
        
    /**
     * Click handler for calculate button in display modal dialog.
     * Calculates a VRA map, then displays the grid points that comprise
     * it as a heat map.
     */
    $scope.calculateVRAMapBtnClick = function(imp) {
        
        $scope.vraMapCalculating = true;
        
        $scope.vraMapFeedback = CALC_VRA_MAP;

        var totalPolygons = getPolygonTotal();
        var measurements = convertPastureMeasurements();
        
        SpreaderMapService.calculateSpreaderMap(imp.paddock, imp.paddock.loc, measurements, 
                                                imp.meterRes.value, totalPolygons, function(vraMap) {
        
            $scope.vraMapFeedback = REND_VRA_MAP;
            
            displaySpreaderMapHeatMap(vraMap.grid);
            displaySpreaderMapPolygons(vraMap.vra);
                        
            $("#calculateSpreaderMapModal").modal('hide');
            $scope.vraMapFeedback = null;
            $scope.vraMapCalculating = false;
        });
    };
    
    $scope.cancelVRAMapBtnClick = function() {
      
        SpreaderMapService.cancel();
        $scope.vraMapFeedback = null;
        $scope.vraMapCalculating = false;
    };
          
    /**
     * Displays VRA map as a heat map.
     */
    var displaySpreaderMapHeatMap = function(vraMap) {

        var bounds = new google.maps.LatLngBounds();

            vraMap.forEach(function(value) {

            $scope.map.vraMapLayer.heatMapPoints.push(
                MapService.createHeatMapPoint(
                    value.lat,
                    value.lon,
                    value.concentration, 
                    value.alt));
            bounds.extend(new google.maps.LatLng(value.lat, value.lon));
        });

        $scope.map.vraMapLayer.heatLayer.setData($scope.map.vraMapLayer.heatMapPoints);     
        $scope.map.googleMap.getGMap().fitBounds(bounds);
    };
    
    /**
     * Displays the polygon areas that make up a vra map.
     */
    var displaySpreaderMapPolygons = function(vra) {
        
        $scope.spreaderMap = vra;        
        $scope.map.vraMapPolygons  = [];        
        var id = 1;

        $scope.spreaderMap.forEach(function (value) {

            var polygon= MapService.createMapVRASection(id++);                    
            value.polygon.coordinates.forEach(function(coordPair) {                        
                polygon.addVRACorner(coordPair[1], coordPair[0]);
            });
            $scope.map.vraMapPolygons.push(polygon);
        });
    };
    
    /**
     * Converts pasture measurements into a format usable by the 
     * VRA map calculator.
     */
    var convertPastureMeasurements = function() {

        var measurements = [];

        $scope.map.mapMarkers.forEach(function(value) {

         if(!value.altitude) { value.altitude = undefined; }

         var measurement = {
                lat: value.position.latitude,
                lon: value.position.longitude,
                alt: value.altitude,
                length: value.length
            };            
            measurements.push(measurement);
        });
        return measurements;
    };

    $scope.setUserPrefPaddock = function(paddock) {

        UserPreferencesService.setPaddock(paddock);
    };

    $scope.changeFarm = function(farm) {

        UserPreferencesService.setFarm(farm);
        updatePaddockList(farm);
    };
    
    var updatePaddockList = function(farm) {
        
        $scope.paddocks = null;
        
        if(farm != null) {
            //$log.debug("farm is not null in pasture Analysis page. te he he . . . ");
            PaddockService.find(farm.id, function(err, res) {

                $scope.paddocks = res;
                $scope.import.paddock = UserPreferencesService.getPaddockFromList($scope.paddocks);
                
                if($scope.import.paddock) {            
                     $scope.newPaddockSelected($scope.import.paddock);  //this will throw an error if gmap isn't ready yet...
                }
            });
        }
    };
   
    $scope.downloadCSVBtnClick = function() {
        
        var csvData = [];
        
        // Convert each vra map value into a csv line and save to csvData.
        $scope.map.vraMapLayer.heatMapPoints.forEach(function(value) {
            
            var line = new MapCsv();
            
            line.loadVRAMapPoint(value);
            
            csvData.push(line.getCsv());
        });       
        return csvData;
    };
    
    /**
     * Formats date for display in a date selector input.
     */
    $scope.formatDate = function(date) {
      
        return date.toLocaleDateString().replace(/\//g,'-');     
    };

    /**
     * Find a paddock's pasture measurements when Data View's Search button is clicked.
     */
    $scope.searchPastureMeasurementsBtnClick = function(paddock) {
                
        if(!paddock) { return; }
       
        $scope.showLoading();

        PastureMeasurementService.findByTimespan(paddock._id, null, $scope.startDate,
            $scope.endDate)
        .then(
        function(result) {

            $scope.map.mapMarkers = [];
            var markerId = 0;
            var bounds = new google.maps.LatLngBounds();
            
            angular.forEach(result, function(value, key) {    
                
                var marker = MapService.createSpatialMarker(value, markerId);
                marker.map = $scope.map.googleMap;
                marker.options.visible = $scope.mapMarkersVisible;
                markerId++;
                
                $scope.map.mapMarkers.push(marker);
                
                bounds.extend(new google.maps.LatLng(value.latitude, value.longitude));
            });
            $scope.hideLoading();
            $scope.map.googleMap.getGMap().fitBounds(bounds);
        },
        function(error) {
            $log.debug(JSON.stringify(error));
            $scope.hideLoading();
        });
    };
       
    /**
     * Display a paddocks border when a paddock is selected.
     */
    $scope.newPaddockSelected = function(paddock) {
       
        $scope.setUserPrefPaddock(paddock);
        
        $scope.paddock.polygonMarkers = [];
        $scope.map.vraMapPolygons = [];
        $scope.map.mapMarkers = [];        
        $scope.pastureMeasurements = [];
        $scope.spreaderMap = [];
        // check setData exists before calling
        if($scope.map.vraMapLayer.heatLayer.setData) {
            $scope.map.vraMapLayer.heatLayer.setData([]); 
        }        
        
        if(!paddock) { return; }
        
        if(typeof google === 'undefined') { return; }
        
        var bounds = new google.maps.LatLngBounds();
        
        paddock.loc.forEach(function(value) {
            $scope.paddock.polygonMarkers.push(value);
            bounds.extend(new google.maps.LatLng(value.latitude, value.longitude));
        });
        $scope.map.googleMap.getGMap().fitBounds(bounds);         
    };

    /**
     * Determines the maximum number of polygons with an area of 18m^2
     * that can fit within the selected paddock.  Returns 120 if
     * the maximum number of polygons exceeds 120.
     */
    var getPolygonTotal = function() {
        
        var polygonRes = 36; // Meters 
        var polygonResArea = polygonRes*polygonRes;
        
        // close polygon before computing area
       // $scope.paddock.polygonMarkers.push($scope.paddock.polygonMarkers[$scope.paddock.polygonMarkers.length - 1]);
        
        var calcAreaPolygon = [];
        $scope.paddock.polygonMarkers.forEach(function(coords) {
            calcAreaPolygon.push(new google.maps.LatLng(coords.latitude, coords.longitude));
        });
        calcAreaPolygon.push(new google.maps.LatLng(
            $scope.paddock.polygonMarkers[0].latitude,
            $scope.paddock.polygonMarkers[0].longitude));
        
        var p = google.maps.geometry.spherical.computeArea(calcAreaPolygon);
                
        var r =  Math.min( p / polygonResArea, 120);
        
        return Math.floor(r);
    };
       
    /**
     * Writes and downloads shape file from data stored in $scope.spreaderMap.
     */
    $scope.downloadShapeFileBtnClick = function() {
        
        if($scope.spreaderMap) {
            var dbSchema = [{ 
                    name: "concentration", 
                    dataType: ShapeFileMaker.EDBAttributeTypes.NUMBER, length: 20}];
            var dbRecord = [];           
            var polygons = [];

            $scope.spreaderMap.forEach(function(value) {

                dbRecord.push({concentration: value.concentration});
                polygons.push(value.polygon);
            });

            ShapeFileMaker.buildFromGeoJSON(polygons, dbSchema, dbRecord);
            ShapeFileMaker.downloadFiles($scope.fileName);
        }
        else { $log.debug("vra map is undefined"); }
    };

    /**
     * Displays the paddock selecte by the UserPreferencesService 
     * when the google map has finished loading.
     */
    uiGmapIsReady.promise().then(function(maps) {

        // If a paddock was found, display it in the map.
        if($scope.import.paddock) {
            $scope.newPaddockSelected($scope.import.paddock);
        }
    });
    
    /**
     * Retrieves list of farms on page load.
     */
    var loadFarms = function() {

        $scope.farms = $scope.userFarms;
                   
        $scope.import.farm = UserPreferencesService.getFarmFromList($scope.userFarms);
        if($scope.import.farm != null) {           
            updatePaddockList($scope.import.farm);
        }
    };
    
    loadFarms();
});
