var module = angular.module( 'ngMoogle.apps.csImporter', [
    'ui.router'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.apps-csImport', {
        url: '/tools/cs-importer',
        views: {
            "home-content": {
                controller: 'appCsImportCtrl',
                templateUrl: 'apps/csImport/csImport.tpl.html'
            }
        },
        data:{ pageTitle: 'Condition Scores Importer' },
        params: {farm: true}
    })
    ;
});

module.controller( 'appCsImportCtrl', function FarmController($q, $log,$scope, $state,UserPreferencesService,
                                         FarmService,HerdService,CategoryService,AnimalService,
                                         MeasurementService ) {
    $scope.state = $state;
    $log.debug("start of page user prefs cs import");
    $log.debug(JSON.stringify(UserPreferencesService.getPrefs()));
    $scope.import = {};

    $scope.import.farm = UserPreferencesService.getFarmFromList($scope.userFarms);
    loadHerds($scope.import.farm);
    
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
        $log.debug(JSON.stringify(UserPreferencesService.getPrefs()));
    };
    
    //========================
    // table data source init
    //========================
    $scope.csvFileLines = [];
    var tableColumns = [        
        {
            name: "Visual ID",
            dataProperty: "vid",
            sortable: true
        },        
        {
            name: "W50",
            dataProperty: "w50",
            sortable: true
        }
    ];
    
    var getRows = function(query) {
            
        if(!query) {
            query = {};
        }
        var deferred= $q.defer();               
        
        var limit = query.limit? query.limit : $scope.csvFileLines.length;
        var offset = query.offset? query.offset : 0;
        var tableRows = [];
        
        angular.copy($scope.csvFileLines, tableRows);
        tableRows.splice(0, offset);
        tableRows.splice(limit, tableRows.length);
        deferred.resolve(tableRows);
        
        return deferred.promise;
    };
    
    var getRowCount = function(query) {
            
        if(!query) {
            query = {};
        }
        var deferred = $q.defer();
        
        deferred.resolve($scope.csvFileLines.length);
        return deferred.promise;
    };
   
    var tableDataSource = { 
        menuButton: [],
        
        columns: tableColumns,
        
        getRows: getRows,
        
        getRowCount: getRowCount
    };
    
    $scope.tableDataSource = tableDataSource;
    // end table data source init
    
    function loadHerds(farm)
    {        
        $scope.herds = [];
        if(!farm){
            return;
        }
        HerdService.findInFarm(farm.id,function(err,herds){
            if(err)
            {
                $log.debug(err);
                return;
            }

            $scope.herds = herds;
            $scope.import.herd = UserPreferencesService.getHerdFromList(herds);

        });
    }
    
    var loadCategorys = function()
    {
        CategoryService.findByName("Condition Score", true, function(err,category){          
        
        if(err)
        {
            $log.debug(err);
            return;
        }          
            $scope.algorithms = category.algorithms;
            $scope.import.algorithm = UserPreferencesService.getCsAlgorithmFromList(category.algorithms);
        });       
        
    }; 
    
    $scope.onSetTime = function(newDate, oldDate) {
        var dateStr = newDate.toLocaleDateString().replace(/\//g, "-");
        $('#dateDisplay').val(dateStr);
    };
            
    /*
    $scope.$watch('date',function(){
        if ($scope.date)
        {
            var day = $scope.date;
            var dd = day.getDate();
            var mm = day.getMonth()+1; //January is 0!
            var yyyy = day.getFullYear();

            if(dd<10) {
                dd='0'+dd;
            } 

            if(mm<10) {
                mm='0'+mm;
            } 

            day = dd+'/'+mm+'/'+yyyy;
            $scope.formatedDate = day;
            $log.debug(day);
        }
        else
        {
            $scope.formatedDate = "Date";
        }        
    });
    */
    var measurementsToCreate;
    var measurementCompletedFunction = function(err,measurement){
        if(err)
            {
                $log.debug(err);
                return;
            }

            $log.debug(measurement);

            if(measurementsToCreate <= 0){
                //we are finished

                $scope.comment = "Condition Score Uploading Finished";

                $log.debug("file uploaded.");
                
            }
     };
    
    
    $scope.importData = function(imp)
    {
    //$log.debug(JSON.stringify(imp));
    var algorithm = $scope.algorithms[0];

    var csvLines = $scope.table;
    
    var date = $scope.date;
    if(csvLines && imp.farm && algorithm && date)
    {
        
        var callbacks = 0;
        var callback = function(err,measurements){
                if(err)
                {
                    $log.debug(err);
                    return;
                }
                callbacks--;
                if(callbacks === 0){
                     $scope.hideLoading();
                     $scope.comment = "Finished uploading condition scores.";
                }
                
        };
        $scope.comment = "Starting Condition Score Import";

        

        var line = null;
        $scope.comment = "Condition Score Uploading";

        measurementsToCreate = csvLines.length;  
        var listOfMeasList = [];
        var index = -1;
        //listOfMeasList[index] = [];
        if(measurementsToCreate)
        {
            for(var i = 0; i < csvLines.length; i++)
            {
                if((i % 500) === 0)
                {
                    index++;
                    listOfMeasList[index] = [];
                }
                line = csvLines[i];                

                var val1 = parseFloat(line.measurement.w05);
                var val2 = parseFloat(line.measurement.w50);
                var val3 = parseFloat(line.measurement.w95);
                if(line.vid != null && line.vid !== "" && !isNaN(val2))
                {
                    var measDetails = {vid:line.vid, w50:val2, timeStamp:Math.floor(date)};
                    listOfMeasList[index].push(measDetails);
                }
            }
            for(var f = 0; f < listOfMeasList.length; f++){
                callbacks++;
                MeasurementService.createMultipleConditionScores(algorithm.id,imp.farm.id, imp.herd.id,listOfMeasList[f],callback);
            }
        }
    }
    else
    {
        $log.debug(imp);
        $scope.comment = "Sorry, we were unable to import this data.";
    }
    };
    $scope.comment = null;
    loadCategorys();


//================================================================csv reader
    function readSingleFile(e) {
        var file = e.target.files[0];
        
        if (!file) {
            return;
        }
        // display file name
        $scope.fileName = file.name;
        
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            //displayContents(contents);
            processData(contents);
        };
        
        reader.readAsText(file);
    }
    
    function processData(csv) {
        $scope.csvFileLines = [];
        var allTextLines = csv.split(/\r\n|\n/);
        var lines = [];
        for (var i=0; i<allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            var tarr = [];
            for (var j=0; j<data.length; j++) {
                tarr.push(data[j]);
            }
            
            $scope.csvFileLines.push({vid: data[0], w50: data[1]});
            lines.push(tarr);
        }
        $scope.tableDataSource.reloadTable();
        logger(lines);
    }

    function logger(lines){
        //for (var line in lines)
        var jsonList = [];
        for(var i = 0; i < lines.length; i ++)
        {
            $log.debug(lines[i]);
            var jsonArg1 = {vid:[],measurement:{w05:null,w50:null,w95:null}};
            
            jsonArg1.vid = lines[i][0];
            jsonArg1.measurement.w50 = lines[i][1];
            //$log.debug(lines[i][0] +", "+ lines[i][1]);
            jsonList.push(jsonArg1);
            $log.debug(jsonArg1);
        }
        //$log.debug(jsonList);
        $scope.table = jsonList;
        $scope.$apply();
    }
    
    // file event
    document.getElementById('file-input').addEventListener('change', readSingleFile, false);

});








