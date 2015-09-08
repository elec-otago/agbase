var module = angular.module( 'ngMoogle.reports.pastureLength', [
    'ui.router', 'uiGmapgoogle-maps'
]);


module.config(function config( $stateProvider, uiGmapGoogleMapApiProvider) {
    $stateProvider.state( 'home.reports-pastureLength', {
        views: {
            "home-content": {
                controller: 'pastureLengthReportCtrl',
                templateUrl: 'reports/pastureLength/pastureLengthReport.tpl.html'
            }
        },
        data:{ pageTitle: 'Pasture Length Report' }
    });
    
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBMKg5EP-e9KEbsPtIlotV1NIz6eWBguCY',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});


module.controller( 'pastureLengthReportCtrl', function pastureLengthReportController( $scope, $state, FarmService, 
                                              PaddockService, PastureMeasurementService, $stateParams, $sce, uiGmapGoogleMapApi ) {
    var zoomPaddock     = 18;
    var zoomStart       = 5;
    var latStart        = -42;
    var lonStart        = 174;
    
    $scope.state = $state;    
    $scope.mapPoints = [];    
    $scope.spreaderMap = [];
    
    $scope.resolutions = [
        {value: 1},
        {value: 2},
        {value: 3},
        {value: 4},
        {value: 5},
        {value: 6},
        {value: 7},
        {value: 9},
        {value: 10},
        {value: 11},
        {value: 12},
        {value: 13},
        {value: 14},
        {value: 15},
        {value: 16},
        {value: 17},
        {value: 18},
        {value: 19},
        {value: 20}
    ];
    
    var loadFarms = function() {

        $scope.farms = $scope.userFarms;
        
        angular.forEach($scope.farms, function(value, key) {
            
            var farm_id = value['id'];
            PaddockService.find(farm_id, function(err, paddocks) {
                value.paddocks = paddocks;
            });
        });     
    };
    
    /**
     * Displays a spreader map on the google map.
     */
    $scope.displaySpreaderMap = function(imp) {
        
        PastureMeasurementService.find(imp.paddock['_id'], null, function(err, res) { //TODO #98
            
            if(err) { return; }
            
            var polygon = getPolygon(imp.paddock);
            console.log(JSON.stringify(polygon[0]));
            var measurements = convertPastureMeasurements(res);
            console.log(JSON.stringify(measurements[0]));
            $scope.spreaderMap = calculateSpreaderMap(imp.paddock, polygon, measurements, imp.meterRes.value);                      
        });
    };
    
    /**
     * Downloads a spreader map as a csv file.
     */
    $scope.importSpreaderMap = function(paddock) {
     
        //TODO: add functionality to import spreader map as csv file.
        alert("Under construction");
    };
    
    /**
     * Extracts and returns polygon coordinates from a paddock.
     */
    var getPolygon = function(paddock) {
        
        var polygon = [];       
        
        paddock.loc.coordinates[0].forEach(function(value) {
            
            polygon.push(new LatLonCoord(value[1], value[0]));
        });
        return polygon;
    };
    
    /**
     * Converts pasture measurements into a format usable by the 
     * Spreader map calculator.
     */
    var convertPastureMeasurements = function(pastureMeasurements) {
     
        var measurements = [];
        
        pastureMeasurements.forEach(function(value) {
           
            measurements.push(new PastureMeasurement(value['location'][1], 
                value['location'][0], value['altitude'], value['length']));
        });        
        return measurements;
    };
    
    /**
     * Calculates a spreader map.
     * 
     * @param paddock           The paddock that this spreader map is calculated for.
     * @param polygon           The latitude and longitude coordinates that define the 
     *                          corners of the paddock.
     * @param measurements      A sample of recent pasture measurements taken from the
     *                          paddock.
     * @param resMeters         The spreader map resolution.
     */
    var calculateSpreaderMap = function(paddock, polygon, measurements, resMeters) {
     
        console.log("calculateSpreaderMap===========================================");
        console.log("paddock: " + paddock.name);
        console.log("polygon coordinates: ");
        console.log(polygon);
        console.log(measurements);
        
        var spreaderMap = [];
        measurements.forEach(function(value) {
            var lat = value.lat;
            var lon = value.lon;
            var map_val = 1.0 / (value.length + 0.1);
            spreaderMap.push(new SpreaderMapPoint(lat, lon, map_val));
        });
            
        return spreaderMap;
    };

    function LatLonCoord(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }
    
    /**
     * Spreader map point object.
     */
    function SpreaderMapPoint(lat, lon, concentration) {
        LatLonCoord.call(this, lat, lon);
        this.concentration = concentration;
    }
    /**
     * Pasture measurement object.
     */
    function PastureMeasurement(lat, lon, alt, length) {
        LatLonCoord.call(this, lat, lon);
        this.length = length;
        this.alt = alt;
    }
        
//todo move into service
    
    var heatMapPoints = [];    
    
    var getWeight = function(length) {
        // Weight is normalized by max grass length
        var maxLength = 50; // cm

        // Cap length to max length
        if (length > maxLength) {
            length = maxLength;
        }

        var weight = (maxLength - length) / maxLength;
        return weight;
    };

    var addPoint = function(lat, lon, length) {
        var weight = getWeight(length);

        var newPoint = {
            location: new google.maps.LatLng(lat, lon),
            weight: weight
        };
        heatMapPoints.push(newPoint);
        return newPoint;
    };

    // Create the heatmap overlay
    var heatLayer;

    var heatLayerCallback = function (layer) {

        heatLayer = layer; //store heat layer when created so we can change the data set
    };


    var loadPastureMeasurements = function(paddockId) {

        $scope.showLoading();

        PastureMeasurementService.findByTimespan(paddockId, null, null, null, function(err, res) { //TODO #98
            if(err) {
                console.log(err);
                return;
            }
            $scope.mapPoints = res;

            heatMapPoints = [];


            var numMeasurement = 0;
            var latTotal = 0;
            var lonTotal = 0;
            
            angular.forEach($scope.mapPoints, function(value, key) {

                var pointLat = value['position']['latitude'];
                var pointLon = value['position']['longitude'];

                var length = value['length'];

                addPoint(pointLat, pointLon, length);

                numMeasurement++;
                latTotal += pointLat;
                lonTotal += pointLon;

            });

            var centerLat = latTotal / numMeasurement;
            var centerLon = lonTotal / numMeasurement;

            centerMap(centerLat, centerLon, zoomPaddock);

            $scope.hideLoading();
        });
    };


    var centerMap = function(lat, lon, zoom) {
        $scope.map = { 
            center: { latitude: lat, longitude: lon },
            zoom: zoom,
            showHeat: true,
            heatLayerCallback: heatLayerCallback,
            heatMapOptions: {
                radius: 20//,
                //dissipating: false
            }
        };

        if(heatLayer) {
            heatLayer.setData(heatMapPoints);
        }
    };

    $scope.updatePaddockList = function(farm) {
        
        $scope.paddocks = null;
        
        if(farm != null) {
            $scope.paddocks = farm.paddocks;
        }
    };
    
    $scope.importData = function(imp) {
        
        $scope.mapPoints= [];
        
        var paddockId = imp.paddock['_id'];
        
        loadPastureMeasurements(paddockId);        
    };
    
    uiGmapGoogleMapApi.then(function(maps) {

        centerMap(latStart, lonStart, zoomStart);        
    });
    
    loadFarms();
});
