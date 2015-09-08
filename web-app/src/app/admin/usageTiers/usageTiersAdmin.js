var module = angular.module( 'ngMoogle.admin.usageTiers', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-usageTiers', {
        views: {
            "home-content": {
                controller: 'UsageTiersAdminCtrl',
                templateUrl: 'admin/usageTiers/usageTiersAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'UsageTiers Admin' }
    });

});


module.controller( 'UsageTiersAdminCtrl', function GlobalRolesAdminCtrl( $scope, $state, UsageTierService ) {

    $scope.$state = $state;

    UsageTierService.findAll().then(function(tiers){

        $scope.tiers = tiers;

    });
});

