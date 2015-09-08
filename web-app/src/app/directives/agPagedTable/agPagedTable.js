/*
* Paged Table directive
*
* usage:
* <agPagedTable dataSource="myDataSource"></agPagedTable>
*
* dataSource should have the following structure:

*
* var myMenuButtons = [{
*   color: "red"
*   text:
*   actionFunction: function(selectedItems) //returns promise to notify if table data changed
*   requiresSelection: true //only enable when something is selected
* }];
*
* var myActionButtons = [{
*       type: "edit",
*       actionFunction: function(rowModel) //returns promise to notify if table data changed
* }, {type: "delete", actionFunction: deleteModel}];
*
*
* var myColumns = [
*   {name: "columName",
*   dataProperty: "rowModel.property"
*   sortable: true,
*   filterable: true,
*   styles: {class: ""}
* ];
*
* dataSource = {
*   menuButtons: myMenuButtons,
*   rowActionButtons: myActionButtons,
*   columns: myColumns,
*   getRows: getMyData,
*   getRowCount: function(query),
*   hasMultiSelect: true
*   hasFilters: true
*   tableEmptyMessage: "No myModel's could be found"
* }
*
*
*/


function extractParameter(object, parameterString) {
    if (!parameterString || !object) {
        return undefined;
    }
    var dotIndex = parameterString.indexOf(".");
    if (dotIndex == -1) {
        return object[parameterString];
    }

    if (dotIndex == parameterString.length) {
        return undefined;
    }
    return extractParameter(object[parameterString.substr(0, dotIndex)], parameterString.substr(dotIndex + 1));
}


function compareDataPoints(a,b,sorting,propertyIndex){
    var keys = Object.keys(sorting);
    if(propertyIndex >= keys.length) {
        return 0;
    }

    var key = keys[propertyIndex];
    var ap = extractParameter(a, key);
    var bp = extractParameter(b, key);
    ap = !isNaN(parseInt(ap,10)) ? parseInt(ap,10) : ap;
    bp = !isNaN(parseInt(bp,10)) ? parseInt(bp,10) : bp;
    var result;
    if(ap > bp || !ap){
        result = 1;
    }else if(bp > ap || !bp){
        result = -1;
    }else{
        result = 0;
    }
    if(sorting[key] == "desc"){
        result *= -1;
    }
    if(!ap && !bp){
        result = 0;
    }
    if(result === 0){
        return compareDataPoints(a,b,sorting,++propertyIndex);
    }
    return result;
}

angular.module('agPagedTableDirective', [
    'ui.router', 'ngTable', 'agActionButtonDirective', 'ui.bootstrap.tpls','ui.bootstrap.pagination'
]).controller('AgPagedTableController', function($ag, $scope, $q) {

    $scope.shouldShowWrapper = false;
  
    var selectedRowModelMap = {};
    var dataSource = {};
    var menuButtons = [];
    
    var init = function(){
        
        console.log("loading AgPaged Table");
        $scope.shouldShowWrapper = true;
        
        $scope.shouldShowTable = true;

        $scope.selectAllCheckBox = {isChecked: false};

        $scope.maxRows = 10;
        $scope.rowCount = 0;
        $scope.currentPage = 1;
        
        dataSource = $scope.dataSource;
        
        menuButtons = dataSource.menuButtons ? dataSource.menuButtons : [];

        if(dataSource.hasMultiSelect){
            //menuButtons.push(selectAllButton); //MDB: not using this button at the moment since I've added the select all checkbox
            menuButtons.push(clearSelectionButton);
        }

        $scope.menuButtons = menuButtons;
        $scope.shouldShowMenu = menuButtons.length > 0;
        
        addFunctionsToDataSource(dataSource);
        
        reloadTable();
    };
    
    var addFunctionsToDataSource = function (source){
    
        source.reloadTable = reloadTable;
        source.init = init;
    };
    
    $scope.setMaxRows = function (rows){

        console.log("changing max rows per page");

        $scope.maxRows = rows;

        loadRows();
    };

    $scope.pageChanged = function(currentPage){

        loadRows();
    };

    var selectAllRows = function(){
        console.log("Select All");

        $ag.forEachIn($scope.rowModels, function(rowModel){
            rowModel.isSelected = true;
            selectedRowModelMap[rowModel.id] = rowModel;
        });
    };
    
    var clearSelection = function(){
        console.log("Clear Selection");

        //TODO: optimise this a bit

        $ag.forEachIn($scope.rowModels, function(rowModel){

            rowModel.isSelected = false;
        });

        selectedRowModelMap = {};
    };


    var selectAllButton = {
        color : "green",
        text: "Select All",
        actionFunction: function(){

            selectAllRows();

            return $q.when(false); //no data modified
        }
    };


    var clearSelectionButton = {
        color : "green",
        text: "Clear Selection",
        requiresSelection: true,
        actionFunction: function(){

            clearSelection();

            setMultiSelectUIState();

            return $q.when(false);
        }
    };

    var loadCount = function(){

        var query = {};

        return dataSource.getRowCount(query).then(function(count){

            console.log("new row count: " + count);

            $scope.rowCount = count;

            return count;
        });
    };


    var loadRows = function() {

        var offset = ($scope.currentPage - 1) * $scope.maxRows;

        var query = {limit: $scope.maxRows, offset: offset};

        return dataSource.getRows(query).then(function(rowModels){

            var oldSelectedRows = selectedRowModelMap;

            selectedRowModelMap = {}; //clear selection and only put row Models that exist in latest data into selectedRowModelMap

            $ag.forEachIn(rowModels, function(rowModel){

                var wasSelected = !!oldSelectedRows[rowModel.id];
                
                if(wasSelected){
                    selectedRowModelMap[rowModel.id] = rowModel;
                    rowModel.isSelected = true;
                }
                                
                // check if action buttons are defined
                if(dataSource.rowActionButtons) {
                    // check if the buttons can be/are disabled
                    dataSource.rowActionButtons.forEach(function(actionButton) {
                        
             //           rowModel.disable = actionButton.disable;
                        
                        if(actionButton.disablePromise) {
                            rowModel.disable = actionButton.disable;
                            actionButton.disablePromise(rowModel)
                            .then(function(isDisabled) {
                                
                                rowModel.disable = isDisabled;
                            });
                        }                        
                    });
                }                
            });

            setMultiSelectUIState();

            $scope.rowModels = rowModels;
            return rowModels;

        });
    };

    var setMultiSelectUIState = function(){
        //select all check box is set if all rows are now selected
        var numSelectedRows = getNumSelectedRows();

        var numPossibleRows = $scope.rowModels ? $scope.rowModels.length : -1;

        $scope.selectAllCheckBox.isChecked = (numSelectedRows === numPossibleRows);

        $ag.forEachIn($scope.menuButtons, function(button){

            if(button.requiresSelection){
                button.disabled = numSelectedRows === 0;
            }

        });
    };

    var reloadTable = function() {

        console.log("loading AgPagedTable data");
        
        return  loadCount().then(function () {

            return loadRows();
        });
    };

    function getNumSelectedRows(){
        var size = 0, key;
        for (key in selectedRowModelMap) {
            if (selectedRowModelMap.hasOwnProperty(key)){
                size++;
            }
        }
        return size;
    }

    function getSelectedRowArray(){

        var rows = [];

        var size = 0, key;
        for (key in selectedRowModelMap) {
            if (selectedRowModelMap.hasOwnProperty(key)){
                rows.push(selectedRowModelMap[key]);
            }
        }
        return rows;
    }

    $scope.extractParameter = extractParameter;


    $scope.selectionChanged = function(rowModel){

        if(rowModel.isSelected){
            selectedRowModelMap[rowModel.id] = rowModel;
        }else{
            delete selectedRowModelMap[rowModel.id];
        }

        setMultiSelectUIState();

        console.log("selectedItems = " + getNumSelectedRows());
    };


    $scope.selectAllCheckBoxToggled = function(isSelected){

        if(isSelected){
            selectAllRows();
        }else if (getNumSelectedRows() === $scope.maxRows){
            //clear all if all is selected when button is toggled
            clearSelection();
        }

        setMultiSelectUIState();
    };


    //called when any of the menu buttons are clicked
    $scope.menuButtonClick = function(menuButton){

        if(! menuButton.actionFunction){
            return;
        }

        menuButton.actionFunction(getSelectedRowArray()).then(function(dataModified){

            if(dataModified){
                reloadTable();
            }
        });
    };


    $scope.actionButtonClicked = function(actionButton, rowModel){

        if(! actionButton.actionFunction){
            return;
        }

        var promise = actionButton.actionFunction(rowModel);

        if(! promise){
            return;
        }

        promise.then(function(dataModified){

            if(dataModified){
                reloadTable();
            }
        });
    };
    
    //load table when the controller loads
    if($scope.dataSource && $scope.dataSource.hasOwnProperty('loadOnPageLoad') && ! $scope.dataSource.loadOnPageLoad){
    
        addFunctionsToDataSource($scope.dataSource); //add iniy function and wait
        
    }else if ($scope.dataSource){
        
        init();
        
    }else{
        console.err('AGPagedTableError: no data source provided');
    }

    
}).directive('agPagedTable', function() {
    return {
        templateUrl: 'directives/agPagedTable/agPagedTable.tpl.html',
        restrict: 'E', //match html element name
        scope: {
            dataSource: "=datasource"
        }
    };

});