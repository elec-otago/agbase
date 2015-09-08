/**
 * Unit tests for the pasture analysis functions
 * 
 * Copyright (c) 2015. Tim Molteno.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Molteno.
 *
 **/

// Set the jasmine fixture path

describe('Calculate Grid', function () {
    beforeEach(function() {
        angular.mock.module( 'ngMoogle' );
    });
    describe('pastureAnalysisReportCtrl', function() {
        var scope, ctrl, timeout, service, $httpBackend;
        beforeEach(inject(function(_$httpBackend_, $timeout, $rootScope, $controller, _PolygonService_, _FarmService_) {
            $httpBackend = _$httpBackend_;
            timeout = $timeout;
            scope = $rootScope.$new();
            ctrl = $controller('pastureAnalysisReportCtrl', {
                $scope: scope,
                PolygonService:  _PolygonService_,
                FarmService: _FarmService_
            });
        }));  
        /*  TODO: remove commented parts once they have been moved to spreaderMapService successfully.
        it('Location has a lat and lon coordinate', function () {
            var a = new scope.location(1,2,123.5);

            describe('has a lat, lon and alt coordinate', function () {
                expect(a.lat).toEqual(1);
                expect(a.lon).toEqual(2);
                expect(a.alt).toEqual(123.5);
            });
        });
        
        it('Grid has many elements', function () {
            var a = new scope.location(-45.5,   179.0,    123.5);
            var b = new scope.location(-45.501, 179.001,    123.5);
            var c = new scope.location(-45.501, 179.002,  123.5);
            var d = new scope.location(-45.5,   179.001,  123.5);
            
            var boundary = [a,b,c,d];
            var paddock = 3.0; // Dummy Value 
            
            var measurements = [a,b,c,d];
            
            var grid;
            scope.calculateGrid(paddock, boundary, measurements, 2.0).then(function (returnGrid) {
              grid = returnGrid;
            });
            scope.$digest();
            timeout.flush();
            
            expect(grid.length).toEqual(2180);
            
            var latMin = 999.0;
            var latMax = -999.0;
            var lonMin = 999.0;
            var lonMax = -999.0;
            grid.forEach(function(value) {
              latMin = Math.min(latMin, value.lat);
              latMax = Math.max(latMax, value.lat);
              lonMin = Math.min(lonMin, value.lon);
              lonMax = Math.max(lonMax, value.lon);
              expect(value.alt >= 2.0).toBeTruthy();

            });
            
            expect(latMin >= -45.501).toBeTruthy();
            expect(latMax <= -45.5).toBeTruthy();
            expect(latMin < latMax).toBeTruthy();
            
            expect(lonMin >= 179.0).toBeTruthy();
            expect(lonMax <= 179.002).toBeTruthy();
            expect(lonMin < lonMax).toBeTruthy();
        });
        */
        /*
        it('SpreaderMap has valid elements', function () {
            var a = new scope.location(-45.5,   179.0,    123.5);
            var b = new scope.location(-45.501, 179.001,    123.5);
            var c = new scope.location(-45.501, 179.002,  123.5);
            var d = new scope.location(-45.5,   179.001,  123.5);
            
            var boundary = [a,b,c,d];
            var paddock = 4.0; // Dummy Value 
            
            var measurements = [new scope.PastureMeasurement(a.lat,a.lon,a.alt,10.0),
                  new scope.PastureMeasurement(b.lat,b.lon,b.alt,10.0),
                  new scope.PastureMeasurement(c.lat,c.lon,c.alt,10.0),
                  new scope.PastureMeasurement(d.lat,d.lon,d.alt,10.0)];
            
            var promise = scope.calculateSpreaderMap(paddock, boundary, measurements, 2.0);
                        
            var spreaderMap;
            scope.calculateSpreaderMap(paddock, boundary, measurements, 2.0).then(function (returnGrid) {
              spreaderMap = returnGrid;
            });
            scope.$digest();
            timeout.flush();

            expect(spreaderMap.length).toEqual(2180);
          
            var latMin = 999.0;
            var latMax = -999.0;
            
            var lonMin = 999.0;
            var lonMax = -999.0;
            
            spreaderMap.forEach(function(value) {
              latMin = Math.min(latMin, value.lat);
              latMax = Math.max(latMax, value.lat);
              lonMin = Math.min(lonMin, value.lon);
              lonMax = Math.max(lonMax, value.lon);
              expect(value.alt >= 2.0).toBeTruthy();
              expect(value.concentration >= 0.0).toBeTruthy();
           });
            
            expect(latMin >= -45.501).toBeTruthy();
            expect(latMax <= -45.5).toBeTruthy();
            expect(latMin < latMax).toBeTruthy();
            
            expect(lonMin >= 179.0).toBeTruthy();
            expect(lonMax <= 179.002).toBeTruthy();
            expect(lonMin < lonMax).toBeTruthy();
        });
        */
//         it('Displaying SpreaderMap works', function () {
//             var a = new scope.location(-45.5,   179.0,    123.5);
//             var b = new scope.location(-45.501, 179.0,    123.5);
//             var c = new scope.location(-45.501, 179.001,  123.5);
//             var d = new scope.location(-45.5,   179.001,  123.5);
//             
//             var boundary = [a,b,c,d];
//             var paddock = 3.0; /* Dummy Value */
//             
//             var measurements = [new scope.PastureMeasurement(a.lat,a.lon,a.alt,10.0),
//                   new scope.PastureMeasurement(b.lat,b.lon,b.alt,10.0),
//                   new scope.PastureMeasurement(c.lat,c.lon,c.alt,10.0),
//                   new scope.PastureMeasurement(d.lat,d.lon,d.alt,10.0)];
//             
//             var promise = scope.calculateSpreaderMap(paddock, boundary, measurements, 2.0);
//                         
//             promise.then(function(sm) {
//               expect(spreaderMap.length).toEqual(168);
//             
//               var latMin = 999.0;
//               var latMax = -999.0;
//               var lonMin = 999.0;
//               var lonMax = -999.0;
//               spreaderMap.forEach(function(value) {
//                 latMin = Math.min(latMin, value.lat);
//                 latMax = Math.max(latMax, value.lat);
//                 lonMin = Math.min(lonMin, value.lon);
//                 lonMax = Math.max(lonMax, value.lon);
//               });
//               
//               expect(latMin >= -45.501).toBeTruthy();
//               expect(latMax <= -45.5).toBeTruthy();
//               expect(latMin < latMax).toBeTruthy();
//               
//               expect(lonMin >= 179.0).toBeTruthy();
//               expect(lonMax <= 179.001).toBeTruthy();
//               expect(lonMin < lonMax).toBeTruthy();
//             });
//         });
// 
        
    });
});
