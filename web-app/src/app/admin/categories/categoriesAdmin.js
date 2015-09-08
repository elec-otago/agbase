/**
 * Created by john on 12/11/14.
 */

var module = angular.module( 'ngMoogle.admin.categories', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-categories', {
        views: {
            "home-content": {
                controller: 'CategoriesAdminCtrl',
                templateUrl: 'admin/categories/categoriesAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'Measurement Categories Admin' }
    })
    ;
});

module.controller( 'CategoriesAdminCtrl', function CategoriesAdminCtrl( $scope, $state, $stateParams, 
                                                                        CategoryService, $sce, $log) {

    $scope.$state = $state;
    
    var loadCategories = function()
    {
        CategoryService.findAll(true, function(err,categories){          
          if(err)
          {
             $log.debug(err);
             return;
          }
            $scope.categories = categories;

        });        
          
    };

    $scope.createCategory = function(category){

        if (category.name !== undefined) {

            $('#addMeasurementCategoriesModal').modal('hide');

            CategoryService.create(category.name,category.isSpatial, function(err,category){

                if(err)
                {
                    $log.debug(err);
                    return;
                }
                loadCategories();
            });
        }
    };

    $scope.openDeleteCategoryModal = function(cat) {
        $scope.categoryToDelete = cat;
    };
    
    $scope.deleteCategory = function()
    {
        if ($scope.categoryToDelete.id !== undefined) {
            CategoryService.remove($scope.categoryToDelete.id, function(err,category){          
                if(err)
                {
                    $log.debug(err);
                    return;
                }
                loadCategories();
                $('#deleteCategoryModal').modal('hide');
            });
        }
    };

    loadCategories();
});

