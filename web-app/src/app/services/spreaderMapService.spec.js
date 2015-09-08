/**
 * Spreader Map Service Test
 * 
 * Copyright (c) 2015. Tim Molteno.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Molteno, Tim Miller.
 *
 *  NOTE: We can't test the spreader map service code here anymore.  This is
 *        due to moving it to common/patches-javascript/spreader-map.js so 
 *        that I can execute the code in a Web Worker to prevent blocking the UI 
 *        during exection.        
 **/
describe('Spreader Map Service', function() {
/*      TODO write tests for spreader-map.js instead
    var SpreaderMapService;
    var timeout;
    var scope;

    beforeEach(function() {

        angular.mock.module( 'ngMoogle');
        
        inject(function(_SpreaderMapService_, $timeout, $rootScope) {
        
            SpreaderMapService = _SpreaderMapService_;
            timeout = $timeout;
            scope = $rootScope.$new();
        });
    });
        
        it('Location has a lat and lon coordinate', function () {
            var a = new Location(1,2,123.5);

            describe('has a lat, lon and alt coordinate', function () {
                expect(a.lat).toEqual(1);
                expect(a.lon).toEqual(2);
                expect(a.alt).toEqual(123.5);
            });
        });
        
        it('Grid has many elements', function () {
            var a = new Location(-45.5,   179.0,    123.5);
            var b = new Location(-45.501, 179.001,  123.5);
            var c = new Location(-45.501, 179.002,  123.5);
            var d = new Location(-45.5,   179.001,  123.5);
            
            var boundary = [a,b,c,d];
            var paddock = 3.0; // Dummy Value 
            
            var measurements = [a,b,c,d];
            
            var grid;
            SpreaderMapService.calculateGrid(paddock, boundary, measurements, 2.0)
            .then(function (returnGrid) {
                
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
                
        it('SpreaderMap has valid elements', function () {
            var a = new Location(-45.5,   179.0,    123.5);
            var b = new Location(-45.501, 179.001,    123.5);
            var c = new Location(-45.501, 179.002,  123.5);
            var d = new Location(-45.5,   179.001,  123.5);
            
            var boundary = [a,b,c,d];
            var paddock = 4.0; // Dummy Value 
            
            var measurements = [new PastureMeasurement(a.lat,a.lon,a.alt,10.0),
                  new PastureMeasurement(b.lat,b.lon,b.alt,10.0),
                  new PastureMeasurement(c.lat,c.lon,c.alt,10.0),
                  new PastureMeasurement(d.lat,d.lon,d.alt,10.0)];
                        
            var spreaderMap;
            SpreaderMapService.calculateSpreaderMap(paddock, boundary, measurements, 2.0)
            .then(function(returnGrid) {
                
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
    });
//});

