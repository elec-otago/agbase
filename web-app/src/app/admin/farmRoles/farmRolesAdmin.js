

//give the module a name
var module = angular.module( 'ngMoogle.admin.farmRoles', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-farmRoles', {
        views: {
            "home-content": {
                controller: 'FarmRolesAdminCtrl',
                templateUrl: 'admin/farmRoles/farmRolesAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Farm Roles Admin' }
    })
    ;
});


module.controller( 'FarmRolesAdminCtrl', function GlobalRolesAdminCtrl( $scope, $state, $stateParams, FarmRoleService, $sce ) {

    $scope.$state = $state;

    var loadFarmRoles = function(){

        FarmRoleService.find(function(err, data) {
            if (err) {
                console.log(err);
                return;
            }


            $scope.farmRoles = data;
            console.log($scope.farmRoles);
        });

    };

    loadFarmRoles();
});

