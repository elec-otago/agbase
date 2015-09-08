

//give the module a name
var module = angular.module( 'ngMoogle.admin.globalRoles', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-globalRoles', {
        views: {
            "home-content": {
                controller: 'GlobalRolesAdminCtrl',
                templateUrl: 'admin/globalRoles/globalRolesAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Agbase: Global Roles Admin' }
    })
    ;
});


module.controller( 'GlobalRolesAdminCtrl', function GlobalRolesAdminCtrl( $scope, $state, $stateParams, GlobalRoleService, $sce ) {

    $scope.$state = $state;

    var loadGlobalRoles = function(){

        GlobalRoleService.findAll().success(function(data){

            $scope.globalRoles = data.roles;

        }).error(function(data, status){

            console.log(status);
            console.log(data);
        });
    };

    loadGlobalRoles();
});

