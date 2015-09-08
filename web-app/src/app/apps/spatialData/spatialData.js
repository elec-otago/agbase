var module = angular.module( 'ngMoogle.apps.spatialData', [
    'ui.router', 'uiGmapgoogle-maps'
]);


module.config(function config( $stateProvider, uiGmapGoogleMapApiProvider) {
    $stateProvider.state( 'home.apps-spatialData', {
        url: '/tools/spatial-data',
        views: {
            "home-content": {
                controller: 'spatialDataCtrl',
                templateUrl: 'apps/spatialData/spatialData.tpl.html'
            }
        },
        data:{ pageTitle: 'Spatial Data' },
        params: {farm: true}
    });
    
    uiGmapGoogleMapApiProvider.configure({
        key: '<google map API key>',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});     

module.controller( 'spatialDataCtrl', function FarmController( $scope, $state, $compile, UserService, 
                 CategoryService, FarmPermissionService, PastureMeasurementService, PaddockService, 
                 MapService, FarmRoleService, $stateParams, $sce, $log, uiGmapGoogleMapApi) {
   
    
    var user = UserService.getCurrentUser();
    if(!user) {
        $state.go("login");
    }
    
    $scope.viewFarms = []; // Farms the user has view permissions.
    $scope.viewPaddocks = [];
    $scope.viewCategories = [];
    $scope.viewAlgorithms = [];
    $scope.manageFarms = [];  // Farms the user has edit permissions.
    $scope.csvImport = {};
    $scope.viewImport = {};
    $scope.csvFile = null;
    
    $scope.state = $state;
    
    $scope.farmManager = false; // flag used to determine if the pasture measurement edit/delete buttons are enabled.
    
    $scope.map = MapService.createMap();
    $scope.openInfowindow = null;
    
    // Initialize length dropdown for edit spatial measurement dialog.
    $scope.measurementLengths = [];    
    var initMeasurementLen = function() {        
        for(var i = 1; i <= 30; i++) {
            $scope.measurementLengths.push({
               value: i,
               display: i + "cm"
            });
        }
        $scope.selectedLength = $scope.measurementLengths[0];
    };
            
    /**
     * Marker click event handler.
     * Displays an info window that shows the spatial measurement length, 
     * an edit button, and a delete button.
     */
    $scope.map.markerEvents.click = function(marker, event, args) {
         
        // Close and remove reference to currently open infowindow
        // if it exists.
        if($scope.openInfowindow) {             
            $scope.openInfowindow.close();
            $scope.openInfowindow = null;
        }           
        
        // Create and compile an infowindow for the clicked marker.
        var htmlElement = MapService.createMarkerInfoWindow(marker.model); 
        var compiled = $compile(htmlElement)($scope);        
        var infowindow = new google.maps.InfoWindow({
            map: $scope.map.googleMap.getGMap(),
            content: compiled[0]
        });
                
        // Open info window.
        infowindow.open($scope.map.googleMap.getGMap(), marker);
        $scope.openInfowindow = infowindow;
        
        google.maps.event.addListener(
            $scope.openInfowindow, 'closeclick',function() {
                    $scope.openInfowindow = null;                
            });       
    };
    
    /**
     * displays an edit spatial measurement dialog
     */
    $scope.editSpatialLength = function(markerId, spatialId, measurementLength) {
        
        $scope.focusedSpatial = { 
            markerId: markerId,
            measurementId: spatialId,
            length: measurementLength
        };
        $scope.selectedLength = $scope.measurementLengths[measurementLength - 1];
        $("#editSpatialDataModal").modal('show');
    };       
   
    /**
     * Updates an edited pasture measurement 
     */
    $scope.updateMeasurement = function() {

        var id = $scope.focusedSpatial.measurementId;
        var length = $scope.selectedLength.value;
        
        PastureMeasurementService.update(id, length, function(err, res) {
          
            if(res) {
                
                $scope.map.mapMarkers[$scope.focusedSpatial.markerId].length = length;
                $scope.focusedSpatial.length = length;
                
                var htmlElement = MapService.createMarkerInfoWindow($scope.focusedSpatial); 
                var compiled = $compile(htmlElement)($scope);
                $scope.openInfowindow.setContent(compiled[0]);
            }
            else {
                $log.debug(err);                
            }
        });
    };
   
    /**
     * displays a delete spatial measurement dialog
     */
    $scope.deleteSpatial = function(markerId, spatialId, measurementLength) {
        
        $scope.focusedSpatial = { 
            id: markerId,
            measurementId: spatialId,
            length: measurementLength
        };
        $("#deleteSpatialDataModal").modal('show');
    };

    /**
     * deletes the current "focused" pasture measurement from the AgBase server and
     * it's corresponding map marker.
     */
    $scope.deleteFocused = function() {

        // Delete marker.
        PastureMeasurementService.remove($scope.focusedSpatial.measurementId, function(res) {

            $scope.map.mapMarkers[$scope.focusedSpatial.id].options.visible = false;
            $scope.focusedSpatial = null;
            
            $scope.openInfowindow.close();
            $scope.openInfowindow = null;
                        
            $("#deleteSpatialDataModal").modal('hide');
        });
    };

    var loadFarms = function() {

        FarmRoleService.find(function(err, roles) { // get a list of all farm roles

            var editRoles = [];

            roles.forEach(function(role) {      

                if(role.editFarmMeasurements) { 
                    editRoles.push(role.id);
                }                
            });

            FarmPermissionService.find(user.id, null, true, false, true, function(err,permissions) {

                if(err) {
                    console.log(err);
                    return;
                }
                permissions.forEach(function(permission) {                

                    var farm = permission.farm;
                    farm.userPermission = permission.role.name;
                    
                    $scope.viewFarms.push(farm);

                    editRoles.forEach(function(roleId) { 

                        // Check for permission to edit.
                        if(permission.farmRoleId === roleId) {

                            $scope.manageFarms.push(farm);
                        }
                    });
                    PaddockService.find(farm.id, function(err, paddocks) {
                        farm.paddocks = paddocks;
                    });                    
                });
            });            
        });
    };

    var loadCategories = function() {

        $scope.viewCategories = [];
        $scope.viewAlgorithms = [];

        CategoryService.findAllSpatial(true, function(err, res) {

           res.forEach(function(category) {

                $scope.viewCategories.push(category);
           });
        });
    };

    /**
     * Gets and displays pasture measurements for the paddock that has  
     * an id equal to the paddockId parameter.
     */
    var loadPastureMeasurements = function(paddockId, category, algorithm) {
        
        $scope.showLoading();                
        
        PastureMeasurementService.findByTimespan(paddockId, algorithm, $scope.startDate, 
            $scope.endDate)
        .then(
        function(result) {
            
            $scope.map.mapMarkers = [];                         
            var markerId = 0;
            var bounds = new google.maps.LatLngBounds();

            angular.forEach(result, function(value, key) {
                
                var marker = MapService.createSpatialMarker(value, markerId);
                marker.map = $scope.map.googleMap;
                markerId++;
                
                $scope.map.mapMarkers.push(marker);
                
                bounds.extend(new google.maps.LatLng(value.latitude, value.longitude));
            });
            $scope.hideLoading();            
            $scope.map.googleMap.refresh(bounds.getCenter());
            $scope.map.googleMap.getGMap().fitBounds(bounds);
        },
        function(error) {
            $log.debug(JSON.stringify(error));
            $scope.hideLoading(); 
        });
    };

    /**
     * File selected
     */
    var selectFile = function(e) {

        $scope.csvFile = e.target.files[0];
    };
    // file change event listener
    document.getElementById('getFileBtn').addEventListener('change', selectFile, false);

    /**
     * Upload file
     */
    $scope.uploadFile = function(imp) {

        if($scope.csvFile && imp && imp.paddock) {

            var csvReader = new FileReader();
            csvReader.onload = processFile;
            csvReader.readAsText($scope.csvFile);
        }
    };

    /**
     * Csv file processing.
     */
    var processFile = function(file) {

        if(!$scope.csvImport.paddock) {
            //TODO display select a paddock message
            return;
        }

       // var p_id = $scope.csvImport.paddock['_id'];
        var p_id = $scope.csvImport.paddock._id;
        var rows = file.target.result.split(/\r\n|\n/);

        // for each line in csv file
        rows.forEach(function(value) {

            var cols = value.split(',');    

            var location = [ cols[2], cols[1] ];

            PastureMeasurementService.create(cols[0], p_id, location, cols[3], cols[4], function(err, res) {
            });
        });
    };

    $scope.onStartDateSet = function(newDate, oldDate) {

        $("#startDateDisplay").val($scope.formatDate(newDate));
    };

    $scope.onEndDateSet = function(newDate, oldDate) {

        $("#endDateDisplay").val($scope.formatDate(newDate));
    };

    /**
     * Formats date for display in a date selector input.     
     */
    $scope.formatDate = function(dateObj) {

        return dateObj.toLocaleDateString().replace(/\//g,"-");
    };

    /**
     * Updates the list of viewable paddocks.
     */ 
    $scope.onSelectFarm = function(farm) {

        $scope.viewPaddocks = null;

        if(farm != null) {
            $scope.farmManager = farm.userPermission === "Manager";
            $scope.viewPaddocks = farm.paddocks;
        }
    };

    /**
     * Updates the list of paddocks that can recieve a list of measyrements.measurements
     */
    $scope.updateCsvPaddockList = function(farm) {

        $scope.csvPaddocks = null;

        if(farm != null) {
            console.log(farm);
            $scope.csvPaddocks = farm.paddocks;
        }
    };
    /**
     * Display pasture measurements
     */ 
    $scope.onClickView = function(imp) {

        // check if a paddock has been selected (required)
        if(imp && imp.paddock) {

            $scope.mapPoints= [];

            //var paddockId = imp.paddock['_id'];
            var paddockId = imp.paddock._id;
            var category = null;
            var algorithm = null;

            if(imp.category) {

                category = imp.category.id;
            }
            if(imp.algorithm) {

                algorithm = imp.algorithm.id;
            }

            loadPastureMeasurements(paddockId, category, algorithm);
        }
    };

    $scope.onSelectCategory = function(category) {

        $scope.viewAlgorithms = [];

        if(!category) { return; }

        category.algorithms.forEach(function(algorithm) {

            $scope.viewAlgorithms.push(algorithm);
        });
    };

    loadFarms();
    loadCategories();
    initMeasurementLen();
});
