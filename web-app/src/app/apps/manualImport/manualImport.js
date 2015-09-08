var module = angular.module( 'ngMoogle.apps.manualImport', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.apps-manualImport', {
        views: {
            "home-content": {
                controller: 'appManualImportCtrl',
                templateUrl: 'apps/manualImport/manualImport.tpl.html'
            }
        },
        data:{ pageTitle: 'Condition Scores Importer<' },
        params: {farm: true}
    })
    ;
});

module.controller( 'appManualImportCtrl', function FarmController( $scope, $state,FarmService,AnimalService, AlgorithmService, $stateParams, $sce ) {
    $scope.state = $state;
    
    $scope.farms = $scope.userFarms;
    $scope.updateHerdList = function(farm)
    {
        
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
    
    
var loadAlgorithms = function()
    {
        AlgorithmService.findAll(true, function(err,algorithms){          
        if(err)
        {
            console.log(err);
            return;
        } 
            //console.log(algorithms[0].measurementCategory.name);
            $scope.algorithms = algorithms;

        });       
        
    };
    
    
    $scope.importData = function(imp)
    {
    //console.log(JSON.stringify(imp));
    
    farmName = JSON.stringify(imp.farm.name);
    herdName = JSON.stringify(imp.herd.name);
    farmID = JSON.stringify(imp.farm.id);
    herdID = JSON.stringify(imp.herd.id);
    eid = JSON.stringify(imp.eid);      
    vid = JSON.stringify(imp.vid);
    
    alg = JSON.stringify(imp.algorithm.name);
    weight = JSON.stringify(imp.weight);
    
    if (true)
    {        
        AnimalService.create(eid, farmID, herdID, vid);
        var stout = "farmName: " +farmName+ ", herd: " +herdName+ ", alg: " +alg+ ", eid: " +eid+ ", vid: " +vid+ ", weight: " +weight;
        console.log(stout);
    }
    };

    loadAlgorithms();
});

