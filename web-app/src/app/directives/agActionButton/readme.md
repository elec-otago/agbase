AgBase Action Button

Button types:

- edit
- chart
- delete
- view
- notes

Usage:

js: 
    $scope.myModel = { name: test };
    
    $scope.myActionFunction = function(model){
    
        console.log(model.name);
    
     };
    
html:

 <ag-action-button type="edit" action="actionFunction(myModel)"></ag-action-button>


 

