/**
 * Farm Overview View controller
 * Hosts a tab bar and nested view
 */

var module = angular.module( 'ngMoogle.farm', [
    'ui.router', 'ngMoogle.farm.herds', 'ngMoogle.farm.animals', 'ngMoogle.farm.measurementsView', 'ngMoogle.farm.members', 'ngMoogle.farm.paddocks'
]);


module.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider
    .state( 'home.farm', {

            //abstract: true,
            //MDB: if ui-router #27 is fixed we should be able to get default state change for abstract states

            redirectTo: 'home.farm.members',

            // This abstract state will prepend '/contacts' onto the urls of all its children.
            url: "/farm/:farmId",

        views: {
            "home-content": { controller: 'FarmCtrl', templateUrl: 'farm/farm.tpl.html'}
        },
        data:{ pageTitle: 'Farm Overview' }
    });

    $urlRouterProvider

        // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
        // Here we are just setting up some convenience urls.
        .when('', '/members')

        // If the url is ever invalid, e.g. '/asdf', then redirect to members page
        .otherwise('/members');
});


module.controller( 'FarmCtrl', function FarmController( $log, $scope, $state, $stateParams,$ag, $filter, UserService, FarmService, HerdService, FarmPermissionService, AnimalService,FarmRoleService, NgTableParams, $sce ) {

    console.log("loaded farm controller");
    $scope.farmId = parseInt($stateParams.farmId,10);
    $log.debug("farm id: " + $scope.farmId);


    UserService.getUserFarms().then(function(farms){

        var farm = $ag.findByIdIn($scope.farmId,farms);
        $scope.farm = farm;

        //TODO: !MDB - I think this information is already in scope, perhaps it should be persistent in UserService
        FarmPermissionService.find($scope.user.id, $scope.farmId, true,true, true, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if (data.length > 0) {
                $scope.userPermissions = data.length > 0 ? data[0].role : null;
                $scope.userPermissions.editFarmPermissions = $scope.userPermissions.editFarmPermissions || $scope.user.role.editFarmPermissions;
                $scope.userPermissions.editFarmHerds = $scope.userPermissions.editFarmHerds || $scope.user.role.editHerds;
                $scope.userPermissions.editFarmAnimals = $scope.userPermissions.editFarmAnimals || $scope.user.role.editAnimals;
                $scope.userPermissions.editFarmMeasurements = $scope.userPermissions.editFarmMeasurements || $scope.user.role.editMeasurements;
            }
        });
    });

    $scope.$state = $state;
});
