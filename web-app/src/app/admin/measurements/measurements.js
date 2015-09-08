/**
* Created by john on 12/11/14.
*/

var module = angular.module( 'ngMoogle.admin.measurements', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-measurements', {
        views: {
            "home-content": {
                controller: 'MeasurementsCtrl',
                templateUrl: 'admin/measurements/measurements.tpl.html'
            }
        },
        data:{ pageTitle: 'Measurements' }
    })
    ;
});

module.controller( 'MeasurementsCtrl', function MeasurementsCtrl( $scope, $state,HerdService,FarmService,AnimalService,GraphingService, $stateParams, MeasurementService, $sce ) {

    $scope.$state = $state;
    
    var loadWeights = function()
    {
        MeasurementService.findAll(function(err,measurements){          
            if(err)
            {
                console.log(err);
                return;
            } 
            $scope.measurements = measurements;

        }); 
    };
    
    var loadFarms = function()
    {
        FarmService.findAll(null,null,null,function(err,farms){          
            if(err)
            {
                console.log(err);
                return;
            } 
                
            $scope.farms = farms;
        });       
        
    };
    
    $scope.updateHerdList = function(farm)
    {
        loadAllAnimals(farm.id, null);
        HerdService.findInFarm(farm.id,function(err,herds){
            if(err)
            {
                console.log(err);
                return;
            }
            console.log(herds);
            $scope.herds = herds;
        });
        
     };
    
    var loadAllAnimals = function(farmid,herdid)
    {
        AnimalService.findAll(farmid, herdid, null, null, null, true, true,function(err,animals){
            if(err)
            {
                console.log(err);
                return;
            } 
            
            $scope.animals = animals;
            console.log(animals[0]);
        });
    };  
    
    $scope.addAnimal = function(eid,vid,farmId,herdId)
    {
        console.log(AnimalService.create(eid,farmId,herdId,vid));
    };
    
    $scope.importData = function(imp)
    {
        loadAllAnimals(imp.farm.id,imp.herd.id);
    };
    
   
    $scope.deleteAnimal = function(id)
    {
        if(id !== undefined)
        {
            AnimalService.remove(id, function(callback) {
        
            $scope.updateAnimalTable($scope.import.herd.id);
            });
        }
    };
    
    
    $scope.storeData = function(animal)
    {
        if(animal !== undefined)
        {
            GraphingService.setAnimal(animal);
        }
        MeasurementService.findAsPromised(animal.id)
        .then(function(measurements) {            
            animal.measurements = measurements;
        });
        //loadAllAnimals();
    };
    
    $scope.deleteMeasurement = function(id)
    {
        if(id !== undefined)
        {
            MeasurementService.remove(id);
        }
        loadAllAnimals();
    };
    
    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls) > -1;
    }
    
    $scope.dropBox = function(id)
    {
        if(id !== undefined)
        {
            $('#'+id).toggleClass('collapse');
            console.log($('#'+id));
        }
    };
    

    
  
    loadFarms();

});

