var module = angular.module( 'ngMoogle.reports.weightTrendGraph', [
    'ui.router',
    'ngMoogle.reports.weightTrendGraphDirective'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.reports-weightTrendGraph', {
        url:'/reports/weight-trend/:animalId',
        views: {
            "home-content": {
                controller: 'WeightTrendGraphCtrl',
                templateUrl: 'reports/weightTrendGraph/weightTrendGraph.tpl.html'
            }
        },
        data:{ pageTitle: 'Weight Trend Graph' },
        params: {farm: true}
    })
    ;
});

module.controller( 'WeightTrendGraphCtrl', function WeightTrendGraphController( $log,$scope, $state, MeasurementService, AnimalService, CategoryService, $stateParams, $sce ) {
    $scope.state = $state;
    $scope.animalId = $stateParams.animalId;
    $scope.algorithms = [];
    $log.debug("graphing service recived value: "+$scope.animalId);
    var data1 = [
        {
            label: "average weight",
            data: [],
            color: '#00b9d7',
            radius:5,
            points: 
            {
                fillColor: "#00b9d7",
                show: true,
                errorbars:"y",
                yerr: {show:true, asymmetric:true, color: "red",lowerCap:"-", upperCap: "-"}               
            }
        }      
    ];   
    
    $scope.data = data1;
    
    
    var getData = function(outData, algorithm)
    {    
        $scope.data = null;
        
        $log.debug("animal: " + JSON.stringify($scope.animal));
        MeasurementService.find($scope.animal.id,algorithm.id,null,$scope.animal.farmId)
        .then(function(measurements){          
                           
            $log.debug(measurements);
            outData[0].data = [];
            
            for(var i = 0; i < measurements.length; i++)
            {
                
                var m = measurements[i];
                //$log.debug(m);
                var median = parseFloat(m.w50);
                if(!isNaN(median))
                {
                    var tempRecord = null;
                    var lowerMargin = median - parseFloat(m.w05);
                    var upperMargin = parseFloat(m.w95) - median;
                    if(!isNaN(lowerMargin)  && !isNaN(upperMargin) ){
                        tempRecord = [new Date(m.timeStamp).getTime(),median,lowerMargin,upperMargin];
                        outData[0].data.push(tempRecord);
                    }
                    else
                    {
                        tempRecord = [new Date(m.timeStamp).getTime(),median];
                        outData[0].data.push(tempRecord);
                    }
                }
            }
            
            $log.debug(outData);
            $scope.data = outData;
        },
        function(err) {
            $log.error(err);
        });
    };
    
    var getAlgorithms = function(){
        CategoryService.findByName("Weight", true, function(err,category){
            if(err){
                $log.error(err);
                return;
            }
            category.algorithms.forEach(function(algorithm) {
            
                MeasurementService.getCountAsPromised({
                    animalId: $scope.animalId,
                    algorithmId: algorithm.id,
                    farmId: $scope.animal.farmId
                })
                .then(function(count) {
                    if(count > 0) {
                        $scope.algorithms.push(algorithm);
                    }
                });
                
            });            
     //       $scope.algorithms = category.algorithms;
        });
    };
    
    var getAnimal = function(){
        AnimalService.get($scope.animalId,function(err,animal){
            if(err)
            {
                $log.error(err);
                return;
            }
            
            $scope.animal = animal;
            getAlgorithms();// needs $scope.animal to be set first...
        });
    };
    
    $scope.changeAlgorithm = function(algorithm){
        
        getData(data1, algorithm);
    };


   
    getAnimal();
 //   getAlgorithms();
});

