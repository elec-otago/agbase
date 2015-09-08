
angular.module( 'ngMoogle.dashboard', [
    'ui.router'
])

    .config(function config( $stateProvider ) {
        $stateProvider.state( 'home.dashboard', {
            url: "/dashboard",
            views: {
                "home-content": {
                    controller: 'DashboardCtrl',
                    templateUrl: 'dashboard/dashboard.tpl.html'
                }
            },
            data:{ pageTitle: 'Dashboard' }
        });
    })

/**
 * And of course we define a controller for our route.
 */
    .controller( 'DashboardCtrl', function DashboardController( $scope, $state, $log, $q, FarmService,
        PastureMeasurementService, CategoryService, MeasurementService, HerdService, PaddockService,
        AnimalService) {
        
        $scope.$state = $state;

        $scope.version = options.appInfo.version;
        $scope.buildDate = options.appInfo.buildDate;           

     //   $scope.weightReqs = [];
        
        /**
         * Constructor used to group farm data into seperate objects.
         */
        var FarmSummary = function(farm) {
        /*
            structure of initialized object:
            
            farmSummary = {

                farm: { <farm from FarmService> }.
            
                pastureMeasurements: {
                    count: <int>,
                    average: <float>,
                    longestName: <string>,
                    longestValue: <float>,
                    shortestName: <string>,
                    shortestValue: <float>,
                    lastRecord: <int>
                },

                weightMeasurements: {
                    count: <int>,
                    sum: <float>,   // maybe (need to be able cancel API calls)
                    average: <float>, // need to be able to cancel API calls first 
                    lastRecord: <int>
                    lastSet: {
                        count: <int>
                        sum:   <float>                        
                        average: <float>                          
                        lastRecord: <int>
                    }
                },

                conditionScores: { 
                    count: <int>,
                    sum: <float>,   // maybe (need to be able cancel API calls)
                    average: <float>, // need to be able to cancel API calls first   
                    lastRecord: <int>,
                    lastSet: {
                        count: <int>
                        sum:   <float>                        
                        average: <float>                          
                        lastRecord: <int>
                    }
                },

                herds: { 
                    count: <int>,
                    largestName: <string>,
                    largestValue: <int>,
                    smallestName: <string>,
                    smallestValue: <int>
                },

                animals: { 
                    count: <int>
                },
            }
        */            
            var _farm = farm;                   this.farm = _farm;
            var pastureMeasurements = {};       this.pastureMeasurements = pastureMeasurements;
            var weightMeasurements = {};        this.weightMeasurements = weightMeasurements;
            var conditionScores = {};           this.conditionScores = conditionScores;
            var herds = {};                     this.herds = herds;
            var animals = {};                   this.animals = animals;
            
            
            /**
             * get all pasture measurements for farm
             */
            var getPastureMeasurements = function() {
                
                pastureMeasurements.count = 0;
                pastureMeasurements.sum = 0;
                pastureMeasurements.average = -1;

                // get all the paddocks that belong to demo farm
                PaddockService.find(_farm.id, function(err, res) {                              
                                    
                    var lastDate = null;
                    var dateNow = Date.now();
                    
                    res.forEach(function(paddock) {

                        (function(paddock) {

                            // get all pasture measurements for the current paddock
                            PastureMeasurementService.findByTimespan(paddock._id, null, null, null, null, null)
                            .then(function(res) {
                                
                                if(res.length > 0) {                            
                                    var numMeasurements = res.length;   // number of measurements
                                    var measurementTotal = 0;           // measurement length total         
                                    var measurementAvg = 0;
                                    
                                    // determine if the most recent pasture measurement
                                    // is the most recent of all pasture measurements
                                    var pastureMeasurementDate = new Date(res[0].created);
                                    
                                    if(!lastDate || pastureMeasurementDate > lastDate) {
                                        lastDate = pastureMeasurementDate;
                                        pastureMeasurements.lastRecord = 
                                            Math.floor( (dateNow - lastDate) / (1000 * 60 * 60 * 24) );
                                    }
                                    
                                    res.forEach(function(pastureMeasurement) {
                                        measurementTotal += pastureMeasurement.length;
                                    });                                                    
                                                    
                                    // calculate average pasture measurement for current paddock
                                    measurementAvg = measurementTotal / numMeasurements;
                                                        
                                    // set paddock with shortest pasture
                                    if(!pastureMeasurements.shortestValue ||
                                    measurementAvg < pastureMeasurements.shortestValue) {                                                        
                                        pastureMeasurements.shortestName = paddock.name;
                                        pastureMeasurements.shortestValue = measurementAvg;
                                    }
                                    
                                    // set paddock with longest pasture
                                    if(!pastureMeasurements.longestValue ||
                                    measurementAvg > pastureMeasurements.longestValue) {                                                            
                                        pastureMeasurements.longestName = paddock.name; 
                                        pastureMeasurements.longestValue = measurementAvg;
                                    }
                                    
                                    // set average pasture measurement
                                    if(pastureMeasurements.average === -1) {
                                        pastureMeasurements.average = measurementAvg;
                                    }
                                    else {
                                        pastureMeasurements.average += measurementAvg;
                                        pastureMeasurements.average /= 2;
                                    }
                                    // update pasture measurement count
                                    pastureMeasurements.count += numMeasurements;                                    
                                }
                            },
                            function(err) {
                                $log.debug("PastureMeasurementService.findByTimeSpan failed to return measurements");
                               // $log.debug(JSON.stringify(err));
                            });  // end find pasture measurements                         
                        })(paddock);                 
                    });// end forEach paddock
                });//end find paddocks
            };
            
            /**
             * get all animals for farm
             */
            var getAnimals = function() {
                
                AnimalService.count(_farm.id, null, function(err, res) {
               
                    if(err) {
                        $log.debug("AnimalService.count failed");
                        $log.debug(JSON.stringify(err));
                        return;
                    }
                    animals.count = res;
                });
            };
            
            /**
             * get all herds for farm
             */
            var getHerds = function() {
                
                HerdService.findInFarm(_farm.id, function(err, res) {
               
                    if(err) {
                        $log.debug("HerdService.findInFarm failed");
                        $log.debug(JSON.stringify(err));
                        return;
                    }
                    herds.count = res.length;
                                            
                    res.forEach(function(value) {
                        
                        (function(herd) {
                            
                            // get total animals in herd
                            AnimalService.count(_farm.id, herd.id, function(err, res) {
                                
                                if(err) {
                                        $log.debug("AnimalService.count failed");
                                        $log.debug(JSON.stringify(err));
                                        return;
                                }
                                                                
                                // set herd with least animals
                                if(!herds.smallestName || res < herds.smallestValue) {
                                    
                                    herds.smallestName = herd.name;
                                    herds.smallestValue = res;
                                }
                                
                                // set herd with most animals
                                if(!herds.largestName || res > herds.largestValue) {
                                    
                                        herds.largestName = herd.name;
                                        herds.largestValue = res;
                                }
                            });
                        })(value);
                    });                
                });
            };
            
            var getMeasurementDataForDisplay = function(categoryName, measurementObj) { // return measurement obj when done plz
                measurementObj.count = 0;
                var dateNow = Date.now();
                
                // find algorithms for the given category parameter.
                return CategoryService.findByName(categoryName, true, function(err, res) {
                    var lastDate = null;
                    var lastDateAlgoId = null;
                    var algoCompleteCounter = 0;
                    var algoTotal = res.algorithms.length;
                    
                    res.algorithms.forEach(function(algo) {                    
                        (function(algoId) {
                            
                            // get count of measurements that have the algorithm id parameter and add to count
                            MeasurementService.getCountAsPromised({farm: _farm.id, algorithm: algoId}).then(
                            function(count) {
                                measurementObj.count += count;
                            },
                            function(err) {
                                $log.debug("MeasurementService.getCountAsPromised failed to return count");
                                $log.debug(JSON.stringify(err));
                            });
                            
                            // get date of last measurement for the current algorithm
                            MeasurementService.findAsPromised(null, algoId, null, _farm.id, null, null, 1).then(
                            function(res) {
                                var algoDate = new Date(res[0].timeStamp);
                                
                                // update last recorded date if this is the last recorded measurement 
                                // for the current category
                                if(!lastDate || algoDate > lastDate) {
                                    lastDate = algoDate;
                                    lastDateAlgoId = algoId;
                                    measurementObj.lastRecord = Math.floor((dateNow - lastDate) / (1000 * 60 * 60 * 24));
                                }
                                algoCompleteCounter++;
                                
                                // check if we have recieved the last date of every algorithm for the 
                                // current category
                                if(algoCompleteCounter === algoTotal) {
                                    return getLastSetData(lastDateAlgoId, measurementObj);
                                }
                            },
                            function(err) {
                                $log.debug("MeasurementService.findAsPromised failed");
                                $log.debug(JSON.stringify(err));
                                
                                algoCompleteCounter++;
                                
                                // check if we have recieved the last date of every algorithm for the 
                                // current category
                                if(algoCompleteCounter === algoTotal) {
                                    return getLastSetData(lastDateAlgoId, measurementObj);
                                }
                            });//end MeasurementService.findAsPromised
                            
                            
                            function getLastSetData(algoId, measurementObj) {
                                
                                measurementObj.lastSet = {
                                    lastRecord: measurementObj.lastRecord,
                                    sum: 0,
                                    average: 0,
                                    count: 0};
                                    
                                var setQuery = {
                                        farm: _farm.id,
                                        algorithm: algoId,
                                        window: 180};
                                
                                // get last set of date timestamps
                                return MeasurementService.getSetsAsPromised(setQuery).then(
                                function(dates) {
                                    var startDate = Date.parse(dates.startDate);
                                    var endDate = Date.parse(dates.endDate);
                                    
                                    var setTotal = 0;
                                    var setAverage = 0;
                                    
                                    var measurementsQuery = {
                                            farm: _farm.id,
                                            algorithm: algoId,
                                            startDate: startDate,
                                            endDate: endDate + 1};
                                            
                                    measurementObj.lastSet.count = dates.count;
                                    if(isNaN(startDate) && isNaN(endDate)) {
                                        return null;
                                    }                                    
                                    return MeasurementService.findAsPromisedWithQuery(measurementsQuery);
                                    
                                })
                                .then(function(measurements) {
                                    
                                    if(measurements) {
                                        measurements.forEach(function(measurement) {
                                            measurementObj.lastSet.sum += parseFloat(measurement.w50);
                                        });
                                        measurementObj.lastSet.average = measurementObj.lastSet.sum / measurementObj.lastSet.count;
                                    }
                                    
                                    return measurementObj;
                                });
                            }
                        })(algo.id);
                    });
                });// end CategoryService.findByName
            };
            
            // initialize the object
            this.init = function() {
                weightMeasurements = getMeasurementDataForDisplay("Weight", weightMeasurements);
                conditionScores = getMeasurementDataForDisplay("Condition Score", conditionScores);
                getPastureMeasurements();
                getAnimals();
                getHerds();
            };
        };
        
       $scope.userFarms = [];

       // rounds a number to 2 decimal points
        $scope.round = function(n){            
            return n.toFixed(2);
        };
     
        var getUserFarmData = function() {

            FarmService.findAll(null, null, null, function(err, res) {

                if(err) {

                    $log.debug("FarmService.findAll failed to return a list of farms.");
                    $log.debug(JSON.stringify(err));
                    return;
                }
                
                $scope.farmCount = res.length;
                                   
                res.forEach(function(farm) {
                    var farmSummary = new FarmSummary(farm);
                    farmSummary.init();
                    $scope.userFarms.push(farmSummary);                    
                });                                
            });
        };
               
        // on template exit listener
        $scope.$on("$destroy", function() {
            $log.debug("leaving dashboard");                
         //   $scope.weightReqs.forEach(function(req) { req.resolve(); } );   // cancels pending weight measurement API calls
            
        });
        
        var init  = function() {
            getUserFarmData();             
        };
        init();
    });