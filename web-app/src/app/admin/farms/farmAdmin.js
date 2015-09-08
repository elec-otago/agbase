/**
 * Created by mark on 15/10/14.
 */


var module = angular.module( 'ngMoogle.admin.farms', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-farms', {
        views: {
            "home-content": {
                controller: 'FarmAdminCtrl',
                templateUrl: 'admin/farms/farmAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Farm Admin' }
    })
    ;
});


module.controller( 'FarmAdminCtrl', function FarmAdminController( $scope, $state, $stateParams, FarmService, $sce ) {

    $scope.$state = $state;
   
    var loadFarms = function()
    {
        FarmService.findAll(false,false,false,function(err,farms){          
          if(err)
          {
             console.log(err);
             return;
          } 
            $scope.farms = farms;
        });  
    };
    
    
    $scope.createFarm = function(farmName){

      if (farmName !== undefined) {
        
        FarmService.create(farmName,function(err,farm){          
          if(err)
          {
             console.log(err);
             return;
          } 
            console.log(farm);
            $('#addFarmModal').modal('hide');
            loadFarms();
        });        
      }
        
    };

    $scope.openDeleteFarmModal = function(farm) {
        $scope.farmToDelete = farm;
    };
    
    $scope.deleteFarm = function()
    {
      if ($scope.farmToDelete.id !== undefined) {
            
        FarmService.remove($scope.farmToDelete.id,function(err,farms){          
          if(err)
          {
             console.log(err);
             return;
          }
            loadFarms();
            $('#deleteFarmModal').modal('hide');
        });          
      }
    };

    loadFarms();
});

