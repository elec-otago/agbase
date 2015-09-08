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

var module = angular.module( 'ngMoogle.farm.measurementsView', [
    'ui.router',
    'ui.bootstrap.datetimepicker'
]);

module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.farm.measurementsView', {
        url: "/animals/measurementsView/:animalId",
        views: {
            "farm-tab-content": {
                controller: 'MeasurementsViewCtrl',
                templateUrl: 'farm/animals/measurementsView.tpl.html'
            }
        }
    });
});


module.controller( 'MeasurementsViewCtrl', function ConditionScoresController( $scope,
    $log, $state, $filter, $stateParams, $sce, $q, AnimalService, MeasurementService ) {
    
    $scope.animalId = $stateParams.animalId;
    
    var getAnimal = function(){
        AnimalService.get($scope.animalId, function(err,animal){
            if(err)
            {
                $log.debug(err);
                return;
            }
            $scope.animal = animal;
            $log.debug("animal: " + JSON.stringify($scope.animal));
        });      
    };
    getAnimal();    
    var tableColumns = [
        {
            name:"Id",
            dataProperty: "id",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"Algorithm",
            dataProperty: "algorithm.name",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"W05",
            dataProperty: "w05",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"W25",
            dataProperty: "w25",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"W50",
            dataProperty: "w50",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"W75",
            dataProperty: "w75",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        },
        {
            name:"W95",
            dataProperty: "w95",
            sortable: true,
            filterable:true,
            styles: {class:"animalColWidth"}
        }
    ];
    
    
    $scope.tableDataSource = {
        
        columns: tableColumns,

        getRows: function (query){

            if(! query){
                query = {};
            }

            query.include = ["algorithm"];

            query.farmId = $scope.animal.farmId;
            query.animalId = $scope.animalId;

            return MeasurementService.findAsPromisedWithQuery(query);
        },

        getRowCount: function (query) {

            if(! query){
                query = {};
            }

            query.farmId = $scope.farmId;
            query.animalId = $scope.animalId;
            return MeasurementService.getCountAsPromised(query);

        },

        hasMultiSelect: true
    };
    
});

