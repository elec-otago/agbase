/**
 * AgBase: Farm Paddocks Overview
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

var module = angular.module( 'ngMoogle.farm.paddocks', [
    'ui.router', 'uiGmapgoogle-maps'
]);


module.config(function config( $stateProvider, uiGmapGoogleMapApiProvider ) {
    $stateProvider.state( 'home.farm.paddocks', {
        url: "/paddocks",
        views: {
            "farm-tab-content": {
                controller: 'FarmPaddocksCtrl',
                templateUrl: 'farm/paddocks/paddocks.tpl.html'
            }
        }
    });

    uiGmapGoogleMapApiProvider.configure({
        key: '<google map API key>',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});


module.controller( 'FarmPaddocksCtrl', function FarmMemberCtrl( $scope, $state, $stateParams,$sce, $log, 
                                                                PaddockService, uiGmapGoogleMapApi, MapService) {
    
    var zoomStart       = 5;
    var latStart        = -42;
    var lonStart        = 174;
   
    // list of paddocks the user can edit.
    $scope.paddocks = [];

    // init edit map
    $scope.editPaddockMap = MapService.createMap();
    $scope.editPaddockMapPolygon = MapService.createMapPaddock();
    var editPaddockMapMarkerId = 1;
    
    // init create map
    $scope.createPaddockMap = MapService.createMap();
    $scope.createPaddockMapPolygon = MapService.createMapPaddock();
    var createPaddockMapMarkerId = 1;
        
    // init view map
    $scope.viewPaddockMap = MapService.createMap();
    $scope.viewPaddockMapPolygon = MapService.createMapPaddock();
       
    //========================
    // Edit paddock functions
    //========================
    /**
     * Edit Paddock map click event listener
     */
    $scope.editPaddockMap.mapEvents.click = function(mapModel, eventName, args) {            
        $scope.$apply(function() {
            
            var markers =  MapService.createPaddockMarkers(args[0].latLng.lat(), args[0].latLng.lng(), editPaddockMapMarkerId);

            $scope.editPaddockMap.mapMarkers.push(markers.mapMarker);
            $scope.editPaddockMapPolygon.polygonMarkers.push({
                latitude: args[0].latLng.lat(), 
                longitude: args[0].latLng.lng()});  
            editPaddockMapMarkerId++;
        });
    };
    /**
     * Edit Paddock map marker drag event listener
     */
    $scope.editPaddockMap.markerEvents.dragend = function(markerModel, eventName, args) {
        $scope.$apply(function() {
            
            MapService.moveBorder(
                markerModel.key,
                $scope.editPaddockMap.mapMarkers,
                $scope.editPaddockMapPolygon.polygonMarkers);
        });        
    };
    /**
     * Edit Paddock map marker click event listener
     */
    $scope.editPaddockMap.markerEvents.click = function(markerModel, eventName, args) {
        $scope.$apply(function() {           

            MapService.deleteMarker(
                markerModel.key, 
                $scope.editPaddockMap.mapMarkers,
                $scope.editPaddockMapPolygon.polygonMarkers);
        });
    };
    
    /**      
     * Updates the dialog paddock's name and boundaries.
     */
    $scope.updatePaddock = function(paddock) {

        if($scope.editPaddockMapPolygon.polygonMarkers.length > 1 && paddock.name)
        {
            // update paddock location coordinates
            paddock.loc = $scope.editPaddockMapPolygon.polygonMarkers;
            
            PaddockService.update(paddock, function(res) {

                $log.debug(res); //TODO provide feedback
                loadPaddocks();
            });            
            $('#editPaddockModal').modal('hide');                
        }
    };
    
    /**
     * Stores a paddock for use by the editPaddockModal dialog.
     */
    $scope.onClickEditPaddock = function(paddock) {
                
        $scope.editPaddockMapPolygon.polygonMarkers = paddock.loc;
        $scope.editPaddockMap.mapMarkers = [];
        $scope.dialogPaddock = paddock;
        
        var bounds = new google.maps.LatLngBounds();
        
        // Check if the dialog paddock has a paddock border to display
        if($scope.dialogPaddock.loc && $scope.dialogPaddock.loc.length > 0) {

            $scope.dialogPaddock.loc.forEach(function (coords) {

                var markers = MapService.createPaddockMarkers(
                    coords.latitude, 
                    coords.longitude, 
                    editPaddockMapMarkerId);
                
                $scope.editPaddockMap.mapMarkers.push(markers.mapMarker);
                editPaddockMapMarkerId++;                       

                bounds.extend(new google.maps.LatLng(coords.latitude, coords.longitude));
            });
        }

        // Center map on paddock to edit.
        $('#editPaddockModal').on('shown.bs.modal', function () {
            $scope.editPaddockMap.googleMap.getGMap().fitBounds(bounds); 
        });
    };
    
    //=======================
    // Add paddock functions
    //=======================
    /**
     * Add Paddock map click event listener
     */
    $scope.createPaddockMap.mapEvents.click = function(mapModel, eventName, args) {            
        $scope.$apply(function() {
                
            // add paddock border marker
            var markers =  MapService.createPaddockMarkers(
                args[0].latLng.lat(), 
                args[0].latLng.lng(), 
                createPaddockMapMarkerId);
            $scope.createPaddockMap.mapMarkers.push(markers.mapMarker);
            
            // add paddock polygon vertice
            $scope.createPaddockMapPolygon.polygonMarkers.push({
                latitude: args[0].latLng.lat(), 
                longitude: args[0].latLng.lng()});
            
            createPaddockMapMarkerId++;
        });
    };

    /**
     * Add Paddock map marker drag event listener
     */
    $scope.createPaddockMap.markerEvents.dragend = function(markerModel, eventName, args) {
        $scope.$apply(function() {
            
            // update postion of polygon vertice
            MapService.moveBorder(
                markerModel.key,
                $scope.createPaddockMap.mapMarkers,
                $scope.createPaddockMapPolygon.polygonMarkers);
           
        });        
    };
    
    /**
     * Add Paddock map marker click event listener
     */
    $scope.createPaddockMap.markerEvents.click = function(markerModel, eventName, args) {
        $scope.$apply(function() {
            
            // delete marker and polygon vertice
            MapService.deleteMarker(
                markerModel.key,
                $scope.createPaddockMap.mapMarkers,
                $scope.createPaddockMapPolygon.polygonMarkers);
        });
    };
    
    /**
     * Displays Add Paddock modal dialog
     */
    $scope.onClickAddPaddock = function() {
                    
        $scope.createPaddockMapPolygon.polygonMarkers = [];
        $scope.createPaddockMap.mapMarkers = [];        
        
        $('#addPaddockModal').on('shown.bs.modal', function () { 
            
            $scope.createPaddockMap.center = { latitude: latStart, longitude: lonStart };
            $scope.createPaddockMap.zoom = zoomStart;
            $scope.createPaddockMap.googleMap.refresh($scope.createPaddockMap.center);
        });        
    };        
    
    /**
     * Creates a new paddock in the selected farm.
     */
    $scope.createPaddock = function(paddockName, farmId) {
                    
        var paddockCoords = $scope.createPaddockMapPolygon.polygonMarkers;
        
        if (paddockName && farmId) {
            
            PaddockService.create(paddockName, farmId, paddockCoords, function (err, paddock) {
                if (err) {
                    $log.debug(err);
                    return;
                }
                $('#addPaddockModal').modal('hide');
                loadPaddocks();
            });
        }        
    };
    
    //========================
    // View paddock functions
    //========================
    /**
     * Displays selected paddock in view modal dialog
     */
     $scope.onClickViewPaddock = function(paddock) {
        
        $scope.viewPaddockMapPolygon.polygonMarkers = paddock.loc;
        $scope.viewPaddockName = paddock.name;
        var bounds = new google.maps.LatLngBounds();
        
        // check if paddock has a border to display
        if(paddock.loc.length > 0) {
        
            paddock.loc.forEach(function(coords) {                 
                bounds.extend(new google.maps.LatLng(coords.latitude, coords.longitude));
            });
        }        
        // center map
        $('#viewPaddockModal').on('shown.bs.modal', function() { 
            $scope.viewPaddockMap.googleMap.getGMap().fitBounds(bounds);             
        });
    };
    
    //==========================
    // Delete paddock functions
    //==========================
    
    /**
     * Displays a modal dialog asking if the user wishes to delete 
     * the selected paddock.  Saves the paddock parameter as 
     * $scope.deletePaddock
     */
    $scope.openDeletePaddock = function(paddock) {      
        $scope.paddockToDelete = paddock;        
    };   
    /**
     * Deletes $scope.deletePaddock after the deletion has been confirmed in
     * the delete paddock modal dialog
     */
    $scope.deletePaddock = function() {
     
        if ($scope.paddockToDelete) {
            
            PaddockService.remove($scope.paddockToDelete._id,function(err) {                
              
                if(!!err){ 
                    $log.debug(err);                 
                }              
                $scope.paddockToDelete = null;              
                loadPaddocks();
            });
        }        
        $("#deletePaddockModal").modal('hide');
    };
    
    /**
     * Centers the add paddock map at the given position.
     * This function is needed by selenium to test adding a paddock.
     */
    $scope.centerMap = function(lat, lon) {
        $scope.createPaddockMap.center = { latitude: lat, longitude: lon };
    };
   
    //==========================
    // Initialization functions
    //==========================
    /**
     * Gets a list of paddocks that belong to the current farm
     * Adds the received paddocks to $scope.farmPaddocks.
     */
    var loadPaddocks = function() {

        PaddockService.find($scope.farm.id, function(err, paddocks) {

            if(!!err){
                //TODO: display error message
                return;
            }

            if(paddocks.length === 0) {
                $scope.farmPaddocks = null;
                $scope.showEmptyMessage = true;
                return;
            }

            $scope.showEmptyMessage = false;
            $scope.farmPaddocks = paddocks;
        });
    };    
    loadPaddocks();
});
