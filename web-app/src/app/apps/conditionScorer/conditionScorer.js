var module = angular.module( 'ngMoogle.apps.conditionScorer', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.apps-conditionScorer', {
        url: '/tools/condition-scorer',
        views: {
            "home-content": {
                controller: 'appconditionScorerCtrl',
                templateUrl: 'apps/conditionScorer/conditionScorer.tpl.html'
            }
        },
        data:{ pageTitle: 'Condition Scores'}
    });
});

module.controller( 'appconditionScorerCtrl', function FarmController($log, $scope, $timeout,$state,UserPreferencesService, HerdService, ConditionScoreService) {
    $scope.state = $state;
    $log.debug("start of page user prefs cs scorer");
    $log.debug(JSON.stringify(UserPreferencesService.getPrefs()));
    $scope.import = {};

    $scope.import.farm = UserPreferencesService.getFarmFromList($scope.userFarms);

    loadHerds($scope.import.farm);

    var loadAlgorithms = function()
    {
        ConditionScoreService.getAlgorithm().then(function(algorithm){

            $scope.algorithms = [algorithm];
            $scope.import.alg = algorithm;

        },function(err){
            $log.error("No CS algorithms found [err: " + err +"]");
        });
    };

    
    //tooltip js // need to add tooltipOptions to the class of what you want to add the tool tip to
    $('.tooltipOptions').tooltip({
        trigger:'hover',
        placement: 'right',
        container: 'body'
    });
    
    $scope.changeFarm = function(farm)
    {
        UserPreferencesService.setFarm(farm);
        loadHerds(farm);
    };

    $scope.changeHerd = function(herd)
    {
        UserPreferencesService.setHerd(herd);
    };

    $scope.changeAlg = function(algorithm)
    {
        UserPreferencesService.setCsAlgorithm(algorithm);
    };
    
    function loadHerds(farm)
    {
        if(!farm){
            return;
        }

        HerdService.findInFarm(farm.id,function(err,herds){
            if(err)
            {
                $log.error(err);
                return;
            }

            $scope.herds = herds;
            $scope.import.herd = UserPreferencesService.getHerdFromList(herds);

        });
        
    }

    $scope.importData = function(imp)
    {
        console.log(JSON.stringify(imp));

        ConditionScoreService.addScore(imp.farm.id,imp.vid,imp.herd.id,parseFloat(imp.score),null).then(function(measurement){
            $log.debug(measurement);
        },function(err){
            $log.error(err);
        });
    };



    //initial load of algorithms
    loadAlgorithms();
});

