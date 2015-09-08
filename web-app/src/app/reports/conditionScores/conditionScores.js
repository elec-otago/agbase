/**
 * AgBase: Condition Scoring Tool
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: John Harbourne.
 *
 **/

var module = angular.module( 'ngMoogle.reports.conditionScores', [
    'ui.router',
    'ngMoogle.reports.conditionScoreGraphDirective',
    'ngSanitize', 
    'ngCsv',
    'ui.bootstrap.datetimepicker',
    'angular-flot'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.reports.conditionScores', {
        url: "/condition-score",
        views: {
            "report-content": {
                controller: 'ConditionScoresCtrl',
                templateUrl: 'reports/conditionScores/conditionScores.tpl.html'
            }
        },
        data:{ pageTitle: 'Condition Score Report' }
    });
});

var dataTemplate =
    {
        data: [],
        bars: {
            show: true,
            align: "center",
            lineWidth: 1
        }
    };

module.controller('ConditionScoresCtrl', function ConditionScoresController( $scope, $state, $stateParams, $log, UserPreferencesService, $sce, ConditionScoreService, MeasurementService, HerdService, AnimalService ) {
    $scope.$state = $state;

    var series = [];
    var downloadedData = [];
    series.push(dataTemplate);
    $scope.data = series;
    $scope.globalCsData = [];
    $scope.dateList = [];
    
    var init = function(){
        $scope.import = {};
        $scope.animals = [];
        $scope.import.farm = UserPreferencesService.getFarmFromList($scope.userFarms);
        loadHerds($scope.import.farm);
        loadAnimals(0);
        //getingCSDates();
    };   

    //formats a utc date string to a locale string for display purposes
    $scope.toLocaleDate = function(utcDateStr) {

        var localeStr = new Date(utcDateStr);
        return localeStr.toLocaleString();
    };
    
    $scope.changeFarm = function(farm)
    {
        UserPreferencesService.setFarm(farm);
        loadHerds(farm);
    };

    $scope.changeHerd = function(herd)
    {        
        UserPreferencesService.setHerd(herd);

    };
    
    function loadHerds(farm)
    {
        $scope.herds = [];
        $scope.dateList = [];
        
        if(!farm){
            $log.debug("farm not set in herds");
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
    
    function loadAnimals(offset){ // this needs to be done well before the download is started or i would do it there.
        if(!$scope.import.farm){
            $log.debug("farm not set in animals");
            return;
        }
        
        var query = {offset:offset};
        query.farm = $scope.import.farm.id;
        query.limit = 1000;
        if($scope.import.herd){
            query.herd = $scope.import.herd.id;
        }
        
        AnimalService.findAsPromised(query).then(function(animals){
            angular.extend($scope.animals, animals);
            if(animals.length == (offset + query.limit)){
                offset += query.limit;
                loadAnimals(offset);
            }
        },function(err){
            $log.error(err);
        });
        
    }
    
    // ================================== getting date list
    
    $scope.getCSDates = function(){
                
        $scope.dateList = [];  
            
        if($scope.import.herd) { // make sure a herd has been selected
            
            var query = {limit:10};
            query.farm = $scope.import.farm.id;
            query.animal = $scope.dateAnimalId;        
            $scope.changeHerd($scope.import.herd);
            query.herd = $scope.import.herd.id;
            
            ConditionScoreService.getDateSet(query).then(function(dateSets){
                            
                for(var i = 0; i < dateSets.length; i++) {                
                    
                    // push if start and end date are defined
                    if(dateSets[i].startDate && dateSets[i].endDate) {
                        $scope.dateList.push({
                            set: dateSets[i], 
                            selected: false                    
                        });
                    }
                }
            },function(err){
                $log.debug(err);
            });
        }
    };
    
    // ============================================= make graph
    $scope.makeGraph = function() {
        var requestList = [];
        $scope.data = [dataTemplate];
        
        if($scope.dateList.length > 0) {

            if($scope.dateList.length === 1) {              // if only one measurement date exists,
                $scope.dateList[0].selected = true;     // check it and move on...
                requestList.push($scope.dateList[0]);
            }
            else {
                for(var i = 0; i < $scope.dateList.length; i++)
                {
                    if($scope.dateList[i].selected){
                        requestList.push($scope.dateList[i]); 
                    }
                }
            }
            requestNewData(requestList);
        }
        else{
            $log.debug("ERROR: Empty Datelist");
        }
    };  
    
    function requestNewData(requestList){
        
        var requestcount = 0;
        var conditionScoresList = [];
        
        var query = {};
        query.farmId = $scope.import.farm.id;
        
        // add herd id to the query if it's specified
        if($scope.import.herd) {
            query.herdId = $scope.import.herd.id;
        }
                
        var promise = function(conditionScores){

            if(conditionScores.length > 0)
            {
                var date = new Date(conditionScores[0].timeStamp).toLocaleString();
                conditionScoresList.push({date:date, csList:conditionScores});//.split('T')[0]
                downloadedData.push({date:date, csList:conditionScores});
                requestcount--;
                if(requestcount === 0){
                    makeGraph(conditionScoresList);
                }
            }
        };
        
        var err = function(err){
            $log.debug(err);
        };        
        
        for(var i = 0; i < requestList.length; i++){
            /* TODO: CHECK ENTIRE STATE OF REQUEST (NOT JUST DATE!!!!!!!!!!!!!!!!)
             if(checkDownloadedData(requestList[i].set.startDate)){
                conditionScoresList.push({date:requestList[i].set.startDate.split('T')[0], csList:getDownloadedData(requestList[i].set.startDate)});
                if(conditionScoresList.length == requestList.length)
                {
                    makeGraph(conditionScoresList);
                }
            }
            else{*/
                requestcount++;                
                var q = angular.copy(query); // need to do this or the last date will override all others
                q.startDate = Date.parse(requestList[i].set.startDate);
                q.endDate = Date.parse(requestList[i].set.endDate) + 1;                
                ConditionScoreService.getScore(q).then(promise, err);
          //  }
        }
    }
    
    function getDownloadedData(date){
        for(var i = 0; i < downloadedData.length; i++)
        {
            if(downloadedData[i].date == date)
            {
                return downloadedData[i].csList;
            }
        }
        return null;
    }
    
    function checkDownloadedData(date){
        for(var i = 0; i < downloadedData.length; i++)
        {
            if(downloadedData[i].date == date)
            {
                return true;
            }
        }
        return false;
    }
    
    function makeGraph(conditionScoresList){

        series = [];
        $scope.globalCsData = conditionScoresList;
        //var width = 0.4;
        
        for(var i = 0; i < conditionScoresList.length; i++){
            var newGraph = angular.copy(dataTemplate);
            
            newGraph.bars.barWidth = 0.09;            
            newGraph.data = formatData(conditionScoresList[i].csList);
            newGraph.color = getRandomColor();
            
            if(conditionScoresList.length > 1){
                newGraph.bars.order = i;
                newGraph.stack = true;
            }
            newGraph.label = conditionScoresList[i].date;

            series.push(newGraph);            
        }
        $scope.data = series;
    }    
     
    function formatData(singleCSList){
        var arr = [];
        var jsonObj = {};
        
        for(var i = 0; i < singleCSList.length; i++) {
            
            if(!jsonObj.hasOwnProperty(singleCSList[i].w50)) {
                jsonObj[singleCSList[i].w50] = 1;
            }
            else {
                jsonObj[singleCSList[i].w50]++;
            }
        }
        Object.keys(jsonObj).forEach(function(key) {
            
            arr.push([
                parseFloat(key), 
                jsonObj[key] 
            ]);
        });
        
        // is there any reason to sort between returning?
        arr.sort(function(a,b){
            if(a[0] > b[0]){
                return 1;
            }
            if(a[0] < b[0]){
                return -1;
            }
            return 0;
        });        
        return arr;
    }
    
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    //=============================================== download
    $scope.getArray = function(){
        var rtn = [];//[{a: 1, b:2}, {a:3, b:4}];
        
        makeAnimalMap();
        
        var numMin = 0;
        var numMax = 7;
        
        if($scope.globalCsData.length > 0){
            var minMax = false;
            if($scope.min !== "" && $scope.max !== "")
            {
                minMax = true;
                numMax = parseFloat($scope.max);
                nummin = parseFloat($scope.min);
            }
            for(var i = 0; i < $scope.globalCsData.length; i++){
                var date = $scope.globalCsData[i].date;
                var csList = $scope.globalCsData[i].csList;
                
                for(var f = 0; f < csList.length; f++){
                    var csvLine = {};
                    //'VID','EID','Condition Score','Date'
                    if($scope.animalMap[csList[f].animalId]){
                        if(minMax){
                            if(csList[f].w50 >= numMin && csList[f].w50 <= numMax){
                                csvLine.a = $scope.animalMap[csList[f].animalId].vid;
                                csvLine.b = $scope.animalMap[csList[f].animalId].eid;
                                csvLine.c = csList[f].w50;
                                csvLine.d = csList[f].timeStamp;
                                $log.debug("csv line");
                                $log.debug(csvLine);
                                rtn.push(csvLine);
                            }
                        }
                        else
                        {
                            
                            csvLine.a = $scope.animalMap[csList[f].animalId].vid;
                            csvLine.b = $scope.animalMap[csList[f].animalId].eid;
                            csvLine.c = csList[f].w50;
                            csvLine.d = csList[f].timeStamp;
                            $log.debug("csv line");
                            $log.debug(csvLine);
                            rtn.push(csvLine);
                        }
                    }
                }
            }
        }
        return rtn;
    };
    
    function makeAnimalMap(){
        var animalMap = {};
        
        for(var i = 0; i < $scope.animals.length; i++){
            animalMap[$scope.animals[i].id] = $scope.animals[i];
        }
        
        $scope.animalMap = animalMap;
        $log.debug("animals and animalMap");
        $log.debug($scope.animals);
        $log.debug(animalMap);
        $log.debug($scope.animalMap);
    }
    
    init();
});

