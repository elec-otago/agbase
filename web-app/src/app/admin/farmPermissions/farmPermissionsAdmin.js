
//give the module a name
var module = angular.module( 'ngMoogle.admin.farmPermissions', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-farmPermissions', {
        views: {
            "home-content": {
                controller: 'FarmPermissionsAdminCtrl',
                templateUrl: 'admin/farmPermissions/farmPermissionsAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Farm Permissions Admin' }
    })
    ;
});


module.controller( 'FarmPermissionsAdminCtrl', function FarmPermissionsAdminCtrl( $scope, $state, $stateParams, UserService, FarmRoleService, FarmPermissionService, FarmService, $sce ) {

    $scope.$state = $state;

     var loadPermissions = function loadPermissions() {
        FarmPermissionService.find(null, null, true, true , true, function (err, permissions) {
            $scope.farmPermissions = permissions;
        });
    };

    FarmService.findAll(false,false,false,function(err, farms){
        if(err)
        {
            console.log(err);
            return;
        }
        $scope.farms = farms;
    });

    FarmRoleService.find(function(err, roles){
        if(err){
            console.log(err);
            return;
        }

        $scope.roles = roles;

    });


    UserService.findAll(function(err, data){
        if(err){
            console.log(err);
            return;
        }

        for(var i =0; i < data.users.length; i++){
            data.users[i].fullName = data.users[i].firstName + " " + data.users[i].lastName;
        }

        $scope.users = data.users;
        console.log($scope.users);
    });

    $scope.createPermission = function createPermission(farm, user, role){
        FarmPermissionService.create(farm.id, user.id, role.id, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            $("#addPermissionModal").modal('hide');
            var current = UserService.getCurrentUser();
            if(current.id == user.id) {
                $scope.userFarms[$scope.userFarms.length] = farm;
            }
            loadPermissions();
        });
    };

    $scope.deletePermission = function(permission){
        if(permission.id){
            FarmPermissionService.remove(permission.id, function(err){
               if(err){
                   console.log(err);
                   return;
               }
               if(permission.user.id == $scope.user.id){
                   var index =  -1;
                   for(var i = 0; i < $scope.userFarms.length; i++){
                       if(permission.farm.id == $scope.userFarms[i].id){
                           index = i;
                           break;
                       }
                   }
                   if(index > -1){
                       $scope.userFarms.splice(index, 1);
                   }
               }
               loadPermissions();
            });
        }
    };

    loadPermissions();

});

