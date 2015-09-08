var module = angular.module( 'ngMoogle.farm.animals', [
    'ui.router', 'agPagedTableDirective'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.farm.animals', {
        url: "/animals",
        views: {
            "farm-tab-content": {
                controller: 'FarmAnimalCtrl',
                templateUrl: 'farm/animals/animals.tpl.html'
            }
        }
    });
});


module.controller( 'FarmAnimalCtrl', function FarmAnimalCtrl( $sce, $scope, CategoryService,
                                        HerdService, AnimalService, MeasurementService, $q,$state) {


    var addAnimalModal = "#addAnimalModal";
    var editHerdModal = '#editAnimalHerdModal';
    var deleteAnimalModal = '#deleteAnimalModal';

    var menuButtonActionDeferred;

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
    
    $scope.showActionModalWithPromise = function(modal){

        menuButtonActionDeferred = $q.defer();

        $(modal).modal('show');

        return menuButtonActionDeferred.promise;
    };

    $scope.cancelActionModal = function(modal){

        $(modal).modal('hide');
        menuButtonActionDeferred.resolve(false); //we didn't modify the animal data
    };

    var closeActionModalWithSuccess = function(modal){

        menuButtonActionDeferred.resolve(true); //we modified the animal data

        $(modal).modal('hide');
    };

    var addAnimalButton = {
        color : "green",
        text: "Add Animal",
        actionFunction: function(){

            return $scope.showActionModalWithPromise(addAnimalModal);
        }
    };

    var deleteAnimalsButton = {
        color : "red",
        text: "Delete Animals",
        requiresSelection: true,

        actionFunction: function(selectedAnimals){

            $scope.editAnimals = selectedAnimals;

            return $scope.showActionModalWithPromise(deleteAnimalModal);
        }
    };

    var changeHerdButton = {
        color : "blue",
        text: "Change Herd",
        requiresSelection: true,
        actionFunction: function(selectedAnimals){

            $scope.editAnimals = selectedAnimals;

            return $scope.showActionModalWithPromise(editHerdModal);
        }
    };

    var tableMenuButtons = [];

    //todo: test permissions

    tableMenuButtons.push(addAnimalButton);
    tableMenuButtons.push(deleteAnimalsButton);
    tableMenuButtons.push(changeHerdButton);


    var viewAnimalMeasurementsActionButton = {
        type: "notes",
        actionFunction: function (animal){
            console.log("view animal measurements");
            $state.go("home.farm.measurementsView", {animalId:animal.id});
        }
    };

    $scope.getDisableConfig = function(animal) {

        var query = {
            algorithmId: $scope.weightAlgorithmIds,
            animal: animal.id,
            farm: $scope.farm.id            
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
        disablePromise: $scope.getDisableConfig
    };

    var tableRowActionButtons = [];

    tableRowActionButtons.push(viewAnimalMeasurementsActionButton);
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


    var tableDataSource = {

        menuButtons: tableMenuButtons,

        rowActionButtons: tableRowActionButtons,

        columns: tableColumns,

        getRows: function (query){

            if(! query){
                query = {};
            }

            query.include = ["herd"];

            query.farmId = $scope.farmId;

            return AnimalService.findAsPromised(query);
        },

        getRowCount: function (query) {

            if(! query){
                query = {};
            }

            query.farmId = $scope.farmId;
            
            return AnimalService.getCountAsPromised(query);

        },

        hasMultiSelect: true
    };


    if(!$scope.farmHerds){
        HerdService.findInFarm($scope.farmId, function(err, herds){

            $("#herdSpinner").hide();
            if(err){
                console.log(err);
                return;
            }

            $scope.farmHerds = herds;
        });
    }

    $scope.createAnimal = function(herdId, eid, vid){

        AnimalService.create(eid, $scope.farm.id, herdId, vid, function(err, animal){
            if(err){
                console.log(err);
                return;
            }
            closeActionModalWithSuccess(addAnimalModal);
        });
    };

    $scope.saveEditedAnimals = function(herd){
        var callback = function(err, data){
            if(err){
                console.log(err);
                return;
            }

            closeActionModalWithSuccess(editHerdModal);
        };

        for(var index in $scope.editAnimals){
            var animal = $scope.editAnimals[index];
            ++$scope.tableModifications;
            AnimalService.update(animal.id, $scope.farm.id, herd.id, animal.eid, animal.vid, callback);
        }
    };

    $scope.deleteAnimals = function(){
        var callback = function(err, data){
            if(err){
                console.log(err);
                return;
            }
            closeActionModalWithSuccess(deleteAnimalModal);
        };

        for(var index in $scope.editAnimals){
            var animal = $scope.editAnimals[index];

            AnimalService.remove(animal.id, callback);
        }
    };
    initWeightAlgorithms();
    $scope.tableDataSource = tableDataSource;
});