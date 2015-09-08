var module = angular.module( 'ngMoogle.admin.animals', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-animals', {
        views: {
            "home-content": {
                controller: 'animalAdminCtrl',
                templateUrl: 'admin/animals/animalAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Animals admin' },
        params: {farm: true}
    })
    ;
});

module.controller( 'animalAdminCtrl', function FarmController( $scope, $state,FarmService,HerdService,AnimalService, $stateParams, $sce ) {
    $scope.state = $state;
      /*       if(permissionLevel == null) {
     $("#editSelectRoles").css("box-shadow", "0px 0px 20px #ff5555");
     return;
     }*/  
    var limit = 1000;
    $scope.animals = [];
    var loadAnimals = function(farmId, herdId, offset){
        AnimalService.findAll(farmId, herdId, null, null, offset, null, null, function(err,animals){
            if(err){
                console.log(err);
                return;
            }
            
            for(var i = 0; i < animals.length; i++)
            {
                $scope.animals.push(animals[i]);
            }
            
            if($scope.animals.length === limit){
                offset += limit;
                loadAnimals(farmId, herdId, offset);
            }
            console.log("animal count " + $scope.animals.length);
        });
            
    };
      
    $scope.selectedFarm = function(farm){
        $scope.animals = [];
        loadAnimals(farm.id,null,0);
    };
    
    $scope.selectedHerd = function(farm,herd){
        $scope.animals = [];
        loadAnimals(farm.id,herd.id,0);
    };
    
    var loadFarms = function()
    {
        FarmService.findAll(true,true,true,function(err,farms){          
          if(err)
          {
             console.log(err);
             return;
          } 
            
            $scope.farms = farms;
        });       
          
    };   
    
    $scope.addAnimal = function(eid,vid,farmId,herdId)
    {
        console.log(AnimalService.create(eid,farmId,herdId,vid));
    };
    


    $scope.deleteAnimal = function(id)
    {
      if(id !== undefined)
      {
        AnimalService.remove(id, function(err,animal){          
          if(err)
          {
             console.log(err);
             return;
          } 
        });     
      }
    };    
    loadFarms();
});

