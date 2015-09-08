
var module = angular.module( 'ngMoogle.admin.readings', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-readings', {
        views: {
            "home-content": {
                controller: 'ReadingsCtrl',
                templateUrl: 'admin/readings/readings.tpl.html'
            }
        },
        data:{ pageTitle: 'Spatial Readings Admin' }
    });
});


module.controller( 'ReadingsCtrl', function ReadingsCtrl( $scope, $state, $stateParams, $sce,
                        FarmService, PaddockService, PastureMeasurementService, CategoryService ) {

    $scope.$state = $state;
    
    var loadReadings = function(paddockId) {

        PastureMeasurementService.findByTimespan(paddockId, null, null, null, null, null, 
                                                 function(err, readings){
            if(err)
            {
                $log.debug(err);
                return;
            }
            $scope.readings = readings;
        });
    };
    
    $scope.getDate = function(dateStr) {
        
        var dateObj = new Date(dateStr);
      
        return dateObj.toLocaleDateString().replace(/\//g,"-");
    };

    $scope.loadReadings = loadReadings;

    var loadFarms = function()
    {
        FarmService.findAll(true,true,true,function(err,farms){          
            if(err)
            {
                $log.debug(err);
                return;
            }
            $scope.farms = farms;
        });
    };

    $scope.updatePaddockList = function(farmId) {

        PaddockService.find(farmId, function(err, paddocks){

            if(err){
                console.log(err);
            }
            else{
                $scope.paddocks = paddocks;
            }

        });
    };
    
    $scope.onSelectCategory = function(category) {
    
        $scope.viewAlgorithms = [];
        
        if(!category) { return; }
        
        category.algorithms.forEach(function(algorithm) {
            
            $scope.viewAlgorithms.push(algorithm);
        });
    };
    
    $scope.onClickShow = function(selection) {        
        
        if(selection && selection.paddockId) {
         
            var algorithmId = null;
            
            if(selection.algorithm) {
             
                algorithmId = selection.algorithm.id;
            }            
            getPastureMeasurements(selection.paddockId, algorithmId);
        }
    };
    
    var getPastureMeasurements = function(paddockId, algorithmId) {
        
        // todo use agPagedTable
        PastureMeasurementService.findByTimespan(paddockId, algorithmId, $scope.startDate, 
            $scope.endDate, null, 1000)
        .then(
        function(result) {
            $scope.readings = result;
        },
        function(error) {    
            $log.debug("error: " + JSON.stringify(error));
        });
    };
    
    $scope.open = function($event, opened) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope[opened] = true;
    };    
    
    $scope.onStartDateSet = function(newDate, oldDate) {
        $("#startDateDisplay").val($scope.getDate(newDate.toString()));
    };
    
    $scope.onEndDateSet = function(newDate, oldDate) {
        $("#endDateDisplay").val($scope.getDate(newDate.toString()));
    };
    
    $scope.deleteReading = function(id){
        
        if(id !== undefined) {
            
            PastureMeasurementService.remove(id, function(res) {
                loadReadings($scope.selection.paddockId);
            });
        }        
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
        
    //on view load
    loadFarms();
    loadCategories();
});

