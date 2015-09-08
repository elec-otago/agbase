/**
* Created by john on 12/11/14.
*/

var module = angular.module( 'ngMoogle.reports.weightTrend', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.reports.weightTrend', {
        url: "/weight-trend",
        views: {
            "report-content": {
                controller: 'WeightTrendCtrl',
                templateUrl: 'reports/weightTrend/weightTrend.tpl.html'
            }
        },
        data:{ pageTitle: 'Weight Trend' }
    });
});

module.controller( 'WeightTrendCtrl', function WeightTrendController( $filter, $log, $scope, 
    UserPreferencesService,UserService, $state,FarmService,HerdService,AnimalService, $stateParams, 
    MeasurementService, CategoryService, $sce ) {

    $scope.$state = $state;
    $scope.import = {};
    $scope.searchText = "";

    $scope.weightAlgorithmIds = [];
    
    var initWeightAlgorithms = function() {
        
        CategoryService.findByName("Weight", true, function(err, category) {
                        
            if(err) {
                $log.debug(err);
                return;
            }
            
            category.algorithms.forEach(function(algorithm) {
                $scope.weightAlgorithmIds.push(algorithm.id);
            });
        });
    };
    
    var initFarms = function() {
        
        UserService.getUserFarms().then(function(farms){
                
            $scope.userFarms = farms;
        
            $scope.import.farm = UserPreferencesService.getFarmFromList(farms);
            
            loadHerds($scope.import.farm, function(herds){
            
                $scope.tableDataSource.init();
                $scope.changeHerd($scope.import.herd);                
            });
        });
    };
        
    $scope.changeFarm = function(farm)
    {
        UserPreferencesService.setFarm(farm);
        loadHerds(farm, $scope.changeHerd);
        if($scope.tableDataSource){
            $scope.tableDataSource.reloadTable();
        }
    };

    $scope.changeHerd = function(herd)
    {
        UserPreferencesService.setHerd(herd);
        //loadAnimals(herd.FarmId,herd.id);
        
        if($scope.import.farm)
        {
            var herdId = $scope.import.herd != null ? $scope.import.herd.id : null;
            if($scope.tableDataSource){
                $scope.tableDataSource.reloadTable();
            }
        }         
    };

    function loadHerds(farm, callback)
    {
        if(!farm){
            return;
        }
        
        HerdService.findInFarm(farm.id,function(err,herds){
            if(err)
            {
                $log.error(err);
                return;
            }

            $scope.herds = herds;
            $scope.import.herd = UserPreferencesService.getHerdFromList(herds);
            
            if (callback){
                callback(herds);
            }
               
        });
    }
    
    $scope.getDisableConfig = function(animal) {
        
        var query = {
            algorithmId: $scope.weightAlgorithmIds,
            animal: animal.id,
            farm: $scope.import.farm.id            
        };
        
        return MeasurementService.getCountAsPromised(query)
        .then(function(count) { 
            
            return count === 0;
        });        
    };
    
    var graphAnimalActionButton = {
        type: "chart",
        actionFunction: function (animal){                     
                        
            $state.go("home.reports-weightTrendGraph", {animalId:animal.id});
        },
        disable: true,
        disablePromise: $scope.getDisableConfig       
    };
   
    var tableRowActionButtons = [];

    tableRowActionButtons.push(graphAnimalActionButton);

    var tableColumns = [
        {
            name:"EID",
            dataProperty: "eid",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"Visual ID",
            dataProperty: "vid",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"Herd",
            dataProperty: "herd.name",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        }
    ];


     tableDataSource = {

        loadOnPageLoad: false, 
         
        menuButtons: [],

        rowActionButtons: tableRowActionButtons,

        columns: tableColumns,

        getRows: function (query){

            if(! query){
                query = {};
            }

            query.include = ["herd"];
            
            query.farm = $scope.import.farm.id;
            if($scope.import.herd)
            {
                query.herd = $scope.import.herd.id;
            }

            return AnimalService.findAsPromised(query);
        },

        getRowCount: function (query) {

            if(! query){
                query = {};
            }

            query.farm = $scope.import.farm.id;
            if($scope.import.herd)
            {
                query.herd = $scope.import.herd.id;
            }
            
            return AnimalService.getCountAsPromised(query);

        }
    };
    
    initWeightAlgorithms();
    initFarms();
    $scope.tableDataSource = tableDataSource;    
});

