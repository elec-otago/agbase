/*
* Action Buttons intended at ag paged table row use
*
* See readme for usage details
 */

var buttonTypes = {
    edit: {styles: {class: "btn btn-success btn-xs"}, icon: "glyphicon glyphicon-edit"},
    chart: {styles: {class: "btn btn-success btn-xs"}, icon: "fa fa-bar-chart-o fa-fw"},
    "delete": {styles: {class: "btn btn-danger btn-xs"}, icon: "glyphicon glyphicon-trash"},
    view: {styles: {class: "btn btn-success btn-xs"}, icon: "glyphicon glyphicon-eye"},
    notes: {styles: {class: "btn btn-success btn-xs"}, icon: "glyphicon glyphicon-scale"}
};

angular.module('agActionButtonDirective', [
    'ui.router'
]).controller('agActionButtonController', function($scope){

    $scope.buttonConfig = buttonTypes[$scope.type];

    if($scope.disable) {
        $scope.disableConfig = $scope.disable;
    }
    else {
        $scope.disableConfig = false;
    }   
    $scope.$watch('disable', function() {
 
        $scope.disableConfig = $scope.disable;
    });
    
}).directive("agActionButton", function(){
    return {
        templateUrl: 'directives/agActionButton/agActionButton.tpl.html',        
        restrict: 'E', //match html element name
        scope: {
            type: "=",
            action: "&",
            disable: "="
        }
    };
});