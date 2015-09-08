/**
 * User Settings Page
 * 
 * Copyright (c) 2014-2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 **/

angular.module( 'ngMoogle.settings', [
    'ui.router'
])

    .config(function config( $stateProvider ) {
        $stateProvider.state( 'home.settings', {
            url: '/settings',
            views: {
                "home-content": {
                    controller: 'SettingsCtrl',
                    templateUrl: 'settings/settings.tpl.html'
                }
            },
            data:{ pageTitle: 'User Settings' }
        })
        ;

    })

/**
 * And of course we define a controller for our route.
 */
    .controller( 'SettingsCtrl', function SettingsController( $scope, $state ) {
        $scope.$state = $state;
    })

;

