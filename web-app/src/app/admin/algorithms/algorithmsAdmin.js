
var module = angular.module( 'ngMoogle.admin.algorithms', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-algorithms', {
        views: {
            "home-content": {
                controller: 'AlgorithmsAdminCtrl',
                templateUrl: 'admin/algorithms/algorithmsAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Algorithms Admin' }
    })
    ;
});


module.controller( 'AlgorithmsAdminCtrl', function AlgorithmsAdminCtrl( $scope, $state, $stateParams, AlgorithmService, CategoryService) {

    $scope.$state = $state;
    var loadAlgorithms = function()
    {
        AlgorithmService.findAll(true, function(err,algorithms){          
            if(err)
            {
                console.log(err);
                return;
            }

            $scope.algorithms = algorithms;
        });       
        
    };
    
    var loadCategories = function()
    {
        CategoryService.findAll(true, function(err,categories){          
            if(err)
            {
                console.log(err);
                return;
            }
            $scope.categories = categories;

        });       
        
    };


    $scope.createAlgorithm = function(name, categoryId){

        if (name !== undefined && categoryId !== undefined) {

            AlgorithmService.create(name, categoryId, function(err,algorithm){
                if(err)
                {
                    console.log(err);
                    return;
                }
                loadAlgorithms();
            });
            $('#addAlgorithmModal').modal('hide');
        }
    };

    $scope.deleteAlgorithm = function(id)
    {
        if (id !== undefined) {
            AlgorithmService.remove(id, function(err,algorithm){
                if(err)
                {
                    console.log(err);
                    return;
                }
                loadAlgorithms();

            });
        }
    };

    loadAlgorithms();
    loadCategories();
});

