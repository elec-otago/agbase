/**
 * AgBase: User Service Test
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

describe( 'UserService', function() {

  var UserService;

  beforeEach( angular.mock.module( 'ngMoogle' ) );

  beforeEach(inject(function(_UserService_){
      UserService = _UserService_;
  }));

  it('#login', function(){

      UserService.logIn('fakeuser@agbase.elec.ac.nz','mysecretpassword').success(function() {

          console.log("logged in");

      }).error(function(err) {
          expect(err).toNotExist();

      });
  });
});
