/**
 * AgBase: Authentication Service Test
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: John Harborne.
 *
 **/

describe('AuthenticationService', function() {
    var AuthenticationService, httpBackend;
    beforeEach(function(){        
        angular.mock.module('ngMoogle');  
        inject(function(_AlgorithmService_, $httpBackend){
            AuthenticationService = _AlgorithmService_;
            httpBackend = $httpBackend;
        });
    });  


    it('should test algorithmService create', function(){
        expect(AuthenticationService.isAuthenticated).toBeFalsy();
        expect(AuthenticationService.isAdmin).toBeFalsy();
        AuthenticationService.isAuthenticated = true;
        AuthenticationService.isAdmin = true;
        expect(AuthenticationService.isAuthenticated).toBeTruthy();
        expect(AuthenticationService.isAdmin).toBeTruthy();
    });
    
});