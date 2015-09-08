/**
 * Reports State controller
 *
 * Copyright (c) 2015. Elec Research.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 *
 * Author: Mark Butler
 *
 **/

angular.module( 'ngMoogle.reports', [
    'ui.router',
    'ngMoogle.reports.weightTrendGraph',
    'ngMoogle.reports.weightTrend',
    'ngMoogle.reports.conditionScores',
    'ngMoogle.reports.pastureLength',
    'ngMoogle.reports.pastureAnalysis'
]);


module.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider
        .state( 'home.reports', {

            abstract: true,

            // This abstract state will prepend '/reports' onto the urls of all its children.
            url: "/reports",

            views: {
                "home-content": { controller: 'ReportCtrl', templateUrl: 'reports/reports.tpl.html'}
            }
        });
});


module.controller( 'ReportCtrl', function ReportsController( $log, $scope, $state, $stateParams, $filter, $sce ) {

    //the intention is to do setup here that is common to all reports and attach stuff onto scope

    $log.debug("loaded reports controller");

});