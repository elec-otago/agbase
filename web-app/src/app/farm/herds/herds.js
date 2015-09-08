var module = angular.module( 'ngMoogle.farm.herds', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.farm.herds', {
        url: "/herds",
        views: {
            "farm-tab-content": {
                controller: 'FarmHerdCtrl',
                templateUrl: 'farm/herds/herds.tpl.html'
            }
        }
    });
});

function countHerd($scope, AnimalService, index){
    var callback = function(err, count){
        if(err){
            console.log(err);
            return;
        }

        $scope.farmHerds[index].count = count;
    };
    $scope.farmHerds[index].count = 0;

    AnimalService.count($scope.farm.id, $scope.farmHerds[index].id, callback);
}
function loadAnimalCount($scope, AnimalService){
    for(var i = 0;i < $scope.farmHerds.length; i++){
         countHerd($scope, AnimalService, i);
     }
}

function loadHerds($scope, farm, HerdService, AnimalService)
{
    HerdService.findInFarm(farm.id, function(err, herds){
        $("#herdSpinner").hide();
        if(err){
            console.log(err);
            return;
        }

        $scope.farmHerds = herds;
        loadAnimalCount($scope, AnimalService);
        $scope.herdsLoaded = true;
    });
}


var createHerd = function($scope, herdName, HerdService, AnimalService){

    if (herdName !== undefined) {

        HerdService.create(herdName,$scope.farm.id, function(err, data) {
            if(err){
                console.log(err);
                return;
            }
            $('#createHerdModal').modal('hide');

            loadHerds($scope, $scope.farm, HerdService, AnimalService);

        });
    }
};


module.controller( 'FarmHerdCtrl', function FarmHerdCtrl( $scope,
    HerdService, AnimalService) {

    console.log("in farm herd controller");

    loadHerds($scope,$scope.farm,HerdService, AnimalService);

    $scope.createHerd = function(herdName){
        createHerd($scope, herdName, HerdService, AnimalService);
    };


    $scope.openHerdEdit = function(herd){
        $("#editHerdModal").modal('show');
        $scope.editHerd = herd;
        $("#editHerdInputName").prop("value", herd.name);
    };


    $scope.saveEditedHerd = function(herd, herdName){

        HerdService.update(herd.id, herdName, function(err, data){
            if(err){
                console.log(err);
                return;
            }

            loadHerds($scope, $scope.farm, HerdService, AnimalService);
        });

        $("#editHerdModal").modal('hide');
        $scope.editHerd = null;
    };


    $scope.openDeleteHerd = function(herd){
        $("#deleteHerdModal").modal('show');
        $scope.editHerd = herd;
    };


    $scope.deleteSelectedHerd = function(herd, deleteAnimals){
        if(deleteAnimals){
            AnimalService.findInHerd($scope.farm.id, herd.id, function(err, data){
                if(err){
                    console.log(err);
                    return;
                }
                var callback = function(err, data){
                    if(err){
                        console.log(err);
                        return;
                    }
                };

                for(var index in data){
                    if(index != "content"){
                        AnimalService.remove(data[index].id, callback);
                    }
                }
            });
        }

        HerdService.remove(herd.id, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }
            loadHerds( $scope, $scope.farm, HerdService, AnimalService);
        });
        $scope.editHerd = null;
        $("#deleteHerdModal").modal('hide');
    };

});