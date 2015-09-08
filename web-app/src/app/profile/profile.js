/**
 * User Profile Page
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

angular.module( 'ngMoogle.profile', [
    'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'home.profile', {
      url: "/profile",
      views: {
          "home-content": {
              controller: 'ProfileCtrl',
              templateUrl: 'profile/profile.tpl.html'
          }
      },
      data:{ pageTitle: 'User Profile' }
  });
})

/**
* And of course we define a controller for our route.
*/
.controller( 'ProfileCtrl', function ProfileController( $scope, $state ,UserService) {
  $scope.$state = $state;
  var user = UserService.getCurrentUser();
  $scope.name = user.firstName + " " + user.lastName;
  $scope.email = user.email;
  
});

