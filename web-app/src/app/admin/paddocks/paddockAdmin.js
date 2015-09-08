/**
 * AgBase: Paddock Admin
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

var module = angular.module( 'ngMoogle.admin.paddocks', [
    'ui.router', 'uiGmapgoogle-maps'
]);

module.config(function config( $stateProvider, uiGmapGoogleMapApiProvider) {
    $stateProvider.state( 'home.admin-paddocks', {
        views: {
            "home-content": {
                controller: 'PaddockAdminCtrl',
                templateUrl: 'admin/paddocks/paddockAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Paddock Admin' }
    });
     
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBMKg5EP-e9KEbsPtIlotV1NIz6eWBguCY',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});


module.controller( 'PaddockAdminCtrl', function PaddockAdminController( $scope, $state, $stateParams, $log,
                                            MapService, PaddockService, FarmService, $sce,  uiGmapGoogleMapApi ) {

    $scope.$state = $state;
   
    
    //TODO: These should go in a config file to cut down repeatition
    var zoomPaddock     = 18;
    var zoomStart       = 5;
    var latStart        = -42;
    var lonStart        = 174;
        
    
    // init add paddock map
    var addPaddockMarkerId = 1;    
    $scope.map = MapService.createMap();
    $scope.mapPaddock = MapService.createMapPaddock();
    
    // init edit map
    $scope.editPaddockMap = MapService.createMap();
    $scope.editPaddockMapPolygon = MapService.createMapPaddock();
    var editPaddockMapMarkerId = 1;

    //==========================
    // Initialization functions
    //==========================
    var loadFarms = function()
    {
        FarmService.findAll(false,false,false,function(err,farms){
            if(err)
            {
                console.log(err);
                return;
            }
            $scope.farms = farms;
        });
    };

    var loadPaddocks = function()
    {
        PaddockService.findAll(true, function(err, paddocks){

            if(err){
                console.log(err);
                return;
            }
            $scope.paddocks = paddocks;
        });
    };
    
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
            
            $scope.editPaddockMap.googleMap.refresh(bounds.getCenter());
            $scope.editPaddockMap.googleMap.getGMap().fitBounds(bounds);
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
    
    //=======================
    // Add paddock functions
    //=======================
    
    /**
     * map click event listener.
     */
    $scope.map.mapEvents.click = function(mapModel, eventName, args) {
        $scope.$apply(function() {
            
            var markers = MapService.createPaddockMarkers(
                args[0].latLng.lat(), 
               args[0].latLng.lng(), addPaddockMarkerId);            
            $scope.map.mapMarkers.push(markers.mapMarker);
            
            $scope.mapPaddock.polygonMarkers.push({
                latitude: args[0].latLng.lat(),
                longitude: args[0].latLng.lng()});            
            addPaddockMarkerId++;
        });      
    };
    /**
     * map marker click event listener
     */
    $scope.map.markerEvents.click = function(markerModel, eventName, args) {
        $scope.$apply(function() {
            
            MapService.deleteMarker(
                markerModel.key, 
                $scope.map.mapMarkers,
                $scope.mapPaddock.polygonMarkers);
        });        
    };    
    
    /**
     * map marker drag event listener
     */
    $scope.map.markerEvents.dragend = function(markerModel, eventName, args) {
        $scope.$apply(function() {
            
            MapService.moveBorder(
                markerModel.key,
                $scope.map.mapMarkers,
                $scope.mapPaddock.polygonMarkers);
        });
    };
    
    /**
     * Displays Create Paddock modal dialog
     */
    $scope.onClickAddPaddock = function() {
                
        $scope.mapPaddock.polygonMarkers = [];
        $scope.map.mapMarkers = [];        
       
        $('#addPaddockModal').on('shown.bs.modal', function () { 
           
            $scope.map.center = { latitude: latStart, longitude: lonStart };
            $scope.map.zoom = zoomStart;
            $scope.map.googleMap.refresh($scope.map.center);
        });        
    };
    
    /**
     * Centers the add paddock map at the given position.
     * This function is needed by selenium to test adding a paddock.
     */
    $scope.centerMap = function(lat, lon) {
        $scope.map.center = { latitude: lat, longitude: lon };
    };
    
    /**
     * Creates a new paddock in the selected farm.
     */
    $scope.createPaddock = function(paddockName, farmId) {
     
        var paddockCoords = $scope.mapPaddock.polygonMarkers;
        
        if (paddockName && farmId) {                        
            PaddockService.create(paddockName, farmId, paddockCoords, function (err, paddock) {
                if (err) {
                    console.log(err);
                    return;
                }
                $('#addPaddockModal').modal('hide');
                loadPaddocks();
            });
        }
    };
    //==========================
    // Delete paddock functions
    //==========================
    
    $scope.openDeletePaddock = function(paddock) {
        $scope.paddockToDelete = paddock;
    };
    
    /**
     * Deletes the paddock with the given id.
     * TODO confirm paddock delete first 
     */
    $scope.deletePaddock = function()
    {
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
    
    loadPaddocks();
    loadFarms();
});
