var module = angular.module( 'ngMoogle.apps.paddockManager', [
    'ui.router', 'uiGmapgoogle-maps'
]);


module.config(function config( $stateProvider, uiGmapGoogleMapApiProvider) {
    $stateProvider.state( 'home.apps-paddockManager', {
        views: {
            "home-content": {
                controller: 'paddockManagerCtrl',
                templateUrl: 'apps/paddockManager/paddockManager.tpl.html'
            }
        },
        data:{ pageTitle: 'Paddock Manager' },
        params: {farm: true}
    });
    
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBMKg5EP-e9KEbsPtIlotV1NIz6eWBguCY',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

module.controller( 'paddockManagerCtrl', function FarmController( $scope, $state, UserService, FarmPermissionService, 
    PaddockService, $stateParams, $sce, uiGmapGoogleMapApi ) {    
    
    var user = UserService.getCurrentUser();
    if(!user) {
        $state.go("login");
    }
    else {
        console.log(user.id);
    }
    //TODO: These should go in a config file to cut down repeatition
    var zoomPaddock     = 18;
    var zoomStart       = 5;
    var latStart        = -42;
    var lonStart        = 174;
 
    // List of paddocks the user can edit.
    $scope.paddocks = [];
     
    $scope.map = { 
        center: { latitude: latStart, longitude: lonStart },
        zoom: zoomStart,
        draw: null,
        mapPoints: []
    };   
    var nextMarkerId = 1;
   
    $scope.polygon = {
        visible: true,
        static: false,
        fill: {
            color: "#808080"
        },
        stroke: {
            weight: 3,
            color: "#808080"
        },
        path: []
    };
        
    // Google map interaction events.
    $scope.mapEvents = {
        click: function(mapModel, eventName, args){
            $scope.$apply(function() {
                
                placeMarker(args[0].latLng.lat(), args[0].latLng.lng());             
            });
        },
        tilesloaded: function (map) {
            $scope.$apply(function () {
                google.maps.event.trigger(map, "resize");
            });
        }
    };
    
    /**
     * Google map marker interaction events.
     */
    $scope.markerEvents = {
        click: function(markerModel, eventName, args) {
            $scope.$apply(function() {
                
                removeMarker(markerModel.key);                            
            });
        }
    };

    /**
     * Updates the dialog paddock's name and boundaries.
     */
    $scope.updatePaddock = function(paddock) {

        paddock.loc = getPathAsGeojson();
        
        PaddockService.update(paddock, function(res) {
            
            console.log(res); //TODO provide feedback 
        });        
    };

    /**
     * Stores a paddock for use by the editPaddockModal dialog.
     */
    $scope.setDialogPaddock = function(paddock) {
        
        $scope.polygon.path = [];
        $scope.map.mapPoints = [];
        
        $scope.dialogPaddock = paddock;
        
        // Check if the dialog paddock has a paddock border to display
        if($scope.dialogPaddock.loc.coordinates &&
            $scope.dialogPaddock.loc.coordinates.length > 0) {
            
            $scope.dialogPaddock.loc.coordinates[0].forEach(function (coords) {
            
                    placeMarker(coords[1], coords[0]);
            });
            // Remove the last coordinate from the markers
            removeMarker(nextMarkerId - 1);
        }
    };
    
    /**
     * Adds a location coordinate to polygon path and map points.
     */
    var placeMarker = function(lat, lon) {
        
         // Create a marker to display a paddock corner.
         var marker = {
            id: nextMarkerId,
            position: {
                latitude: lat,
                longitude: lon
            }
        };              
        $scope.map.mapPoints.push(marker);                
        $scope.polygon.path.push(marker.position);
                
        nextMarkerId++;        
    };
    
    /**
     * Removes a location coordinate from polygon path and map points.
     */
    var removeMarker = function(markerId) {

        var count = 0;
        var isDeleted = false;
                
        // Find clicked marker in mapPoints array.
        while(count < $scope.map.mapPoints.length && !isDeleted) {
                
            if($scope.map.mapPoints[count].id == markerId) {
                      
                // Remove clicked marker from mapPoints array.
                $scope.map.mapPoints.splice(count, 1);
                $scope.polygon.path.splice(count, 1);
                isDeleted = true;                       
            }
            count++;
        }    
    };
    
    /**
     * Returns the polygon path coordinates as a MultiPoint GeoJSON object.
     */
    var getPathAsGeojson = function() {
        
        var geojson = {
            type: "Polygon",
            coordinates:[]            
        };
        var innerCoordinates = [];
        $scope.polygon.path.forEach(function(polyCoords) {
           
            innerCoordinates.push([
                polyCoords.longitude,
                polyCoords.latitude]);           
        });
        
        if($scope.polygon.path.length > 0) {
            //Close the polygon by adding the first coordinate to the end
            innerCoordinates.push([
                    $scope.polygon.path[0].longitude,
                    $scope.polygon.path[0].latitude]);
        }
        
        geojson.coordinates.push(innerCoordinates);
        
        return geojson;
    };
    
    
    /**
     * Returns a list of farm ids and names for farms that the logged
     *  in user has permission to edit.
     */
    var getManagePermissionFarms = function(permissions) {
        
        var manageFarms = [];
        
        permissions.forEach(function(permission) {                
                
            if(permission['role'].editFarmPermissions) {
                                   
                manageFarms.push({
                    farmId: permission['farm'].id,
                    farmName: permission['farm'].name
                });
            }
        });
        return manageFarms;
    };
    
    /**
     * Gets a list of paddocks that belong have a farm id matching the farmDetails.farmId 
     * parameter.  Adds the recieved paddocks to $scope.paddocks.
     */
    var getFarmPaddocks = function(farmDetails) {
        
        PaddockService.find(farmDetails.farmId, function(err, paddocks) {
                            
            // Append farm name to each paddock
            paddocks.forEach(function(paddock) {
                
                paddock['farmName'] = farmDetails.farmName;
                $scope.paddocks.push(paddock);
            });
        });
    };
    
    /**
     * Retrieves a list of paddocks when the user navigates to this page.
     */
    var initPage = function() {
        
        // Get a list of farms that the user has editFarmPermissions for.
        FarmPermissionService.find(user.id, null, true,true, false, function(err,permissions) {
            
            if(err) {
                console.log(err);
                return;
            }           
            var manageFarms = getManagePermissionFarms(permissions);
            
            manageFarms.forEach(function(farmDetails) {
                
                getFarmPaddocks(farmDetails);
            });
        });
    };
    initPage();
});
