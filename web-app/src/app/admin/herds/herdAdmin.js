

//give the module a name
var module = angular.module( 'ngMoogle.admin.herds', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-herds', {
        views: {
            "home-content": {
                controller: 'HerdAdminCtrl',
                templateUrl: 'admin/herds/herdAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Herd Admin' }
    })
    ;
});


module.controller( 'HerdAdminCtrl', function HerdAdminController( $scope, $state, $stateParams, $log,
                                                                  HerdService, FarmService, $sce ) {

    $scope.$state = $state;

    var loadHerds = function()
    {
        HerdService.findAll(true,function(err,herds){          
          if(err)
          {
             $log.debug(err);
             return;
          } 
            $scope.herds = herds;
        });       
          
    };


    var loadFarms = function()
    {
        FarmService.findAll(true,false,false,function(err,farms){          
          if(err)
          {
             $log.debug(err);
             return;
          } 
            $scope.farms = farms;
        });       
          
    };
    
    
    $scope.createHerd = function(herdName, farmId){
    $log.debug("h:"+ herdName + " f:" + farmId );
        if (herdName !== undefined) {            
          HerdService.create(herdName, farmId,function(err,herd){          
            if(err)
            {
              $log.debug(err);
              return;
            } 
          
            $('#addHerdModal').modal('hide');
            loadHerds();
            
          });       
        }
    };

    $scope.openDeleteHerdModal = function(herd) {
        $scope.herdToDelete = herd;
    };

    $scope.deleteHerd = function(){
      
        if ($scope.herdToDelete.id !== undefined) {    
        
            HerdService.remove($scope.herdToDelete.id,function(err,farms){          
                if(err)
                {
                    $log.debug(err);
                    return;
                }
                loadHerds();
                $('#deleteHerdModal').modal('hide');
            });
        }      
    };
    loadHerds();
    loadFarms();
});

