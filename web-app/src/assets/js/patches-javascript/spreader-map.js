/**
 * AgBase: Spreader Map
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Authors: Tim Molteno, Tim Miller
 *
 **/
var SpreaderMap = (function() {    
    'use strict';
    
    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    /**
    * isLeft(): tests if a point is Left|On|Right of an infinite line.
    * Input:  three points p0, p1, and p2
    * Return: >0 for p2 left of the line through p0 and p1
    *         =0 for p2  on the line
    *         <0 for p2  right of the line
    * */
    var isLeft = function( p0, p1, p2 ) {
        return ( (p1.x - p0.x) * (p2.y - p0.y) - (p2.x -  p0.x) * (p1.y - p0.y) );
    };

    //===================================================================


    /**
    * wn_PnPoly(): winding number test for a point in a polygon
    * @param pt = a point,
    * @param vertices = vertex points of a polygon vertices[n+1] with vertices[n]=vertices[0]
    * @return the winding number (=0 only when pt is outside)
    * */
    var wn_PnPoly = function( pt, vertices, n ) {
        var wn = 0;    // the  winding number counter
        
        // loop through all edges of the polygon
        for (var i=0; i<n; i++) {              // edge from vertices[i] to  vertices[i+1]
        if (vertices[i].y <= pt.y) {         // start y <= pt.y
            if (vertices[i+1].y > pt.y)  {     // an upward crossing
            if (isLeft(vertices[i], vertices[i+1], pt) > 0)  { // pt left of  edge
                ++wn;                          // have  a valid up intersect
            }
            }
        } else {                             // start y > pt.y (no test needed)
            if (vertices[i+1].y  <= pt.y)  {   // a downward crossing
            if (isLeft(vertices[i], vertices[i+1], pt) < 0)  {  // pt right of  edge
                --wn;                          // have  a valid down intersect
            }
            }
        }
        }
        return wn;
    };

    /**
    * Test if a point is outside a boundary polygon.
    * 
    * @param boundary    The boundary polygon
    * @param pt          point to test
    * 
    * If pt is on the boundary then this returns true!
    */
    var pointOutside = function(boundary, pt) {
        
        // Handle the special case where the first point of the boundary is the same as the point to be tested.
        
        if ((boundary[0].x === pt.x) & (boundary[0].y === pt.y)) {
        return true;
        }
        var vertexes = [];
        var n = boundary.length;
        boundary.forEach(function(b) {
        vertexes.push(b);
        });
        vertexes.push(new Point(boundary[0].x, boundary[0].y));
        
        var wn = wn_PnPoly(pt, vertexes, n);
        return (wn === 0);
    };


    /**
    * Test if a point is inside a boundary polygon.
    * 
    * @param boundary    The boundary polygon
    * @param pt          point to test
    * 
    * If pt is on the boundary then this returns false!
    */
    var pointInside = function(boundary, pt) {
        return !pointOutside(boundary, pt);
    };
    
    function Location(lat, lon, alt) {
        this.lat = lat;
        this.lon = lon;
        this.alt = alt;
    }

    /**
    * Spreader map point object.
    */
    function SpreaderMapPoint(lat, lon, alt, concentration) {
        Location.call(this, lat, lon, alt);
        
        this.concentration = concentration;
    }
    
    /**
     * Calculates the altitude at a point by looking at the measurements.
     * 
     * @param measurements      The measurements (lat, lon, alt)
     * @param loc               The location to calculate altitude for
     * 
     * TODO. Do a proper interpolation. At the moment, we're just using the altitude
     * of the closest measurement.
     */
    var interpolateAltitude = function(measurements, loc) {
        return closestMeasurement(measurements, loc).alt;
    };
    
    /**
     * Find the closest measurement to the specified location.
     * 
     * @param measurements      The measurements (lat, lon, alt)
     * @param loc               The location to calculate altitude for
     * 
     */
    var closestMeasurement = function(measurements, loc) {
        var dMin = 999.0;
        var closest = []; // closest measurement
        measurements.forEach(function(m) {
            var d = Math.pow(m.lat - loc.lat,2) + Math.pow(m.lon - loc.lon, 2);
            if (d < dMin)  {
                dMin = d;
                closest = m;
            }
        });
        return closest;
    };
        
      /**
      * Calculates a lat-lon grid.
      * 
      * Create a grid over the paddock (a grid is a list of points sampled uniformly
      * 
      * @remark Uniformly is not very well defined. It could be uniform over the surface,
      * (this would make steep slopes look like the samples were closer together).
      * 
      * @param paddock           The paddock that this spreader map is calculated for.
      * @param boundary          The latitude, longitude and altitudes that define the 
      *                          corners of the paddock.
      * @param resMeters         The spreader map resolution.
      * 
      * @remark These grid points should all lie within the boundary.
      * 
      * @todo. Use stored digital elevation maps for paddocks.
      * for the moment, we'll use a linear interpolation of the measurements
      * to provide an estimate of the altitude at each point.
      */
    var calculateGrid = function(paddock, boundary, measurements, resMeters) {
        /**
          * Find the lower and upper bound for the boundary
          */
        var latMin = 999.0;
        var latMax = -999.0;
        var lonMin = 999.0;
        var lonMax = -999.0;
        boundary.forEach(function(value) {
          latMin = Math.min(latMin, value.lat);
          latMax = Math.max(latMax, value.lat);
          lonMin = Math.min(lonMin, value.lon);
          lonMax = Math.max(lonMax, value.lon);
        });
        
        var vertexes = [];
        boundary.forEach(function(b) {
          vertexes.push(new Point(b.lat, b.lon));
        });

        /**
          * Scan through the points in the grid. Keeping those
          * that lie inside the boundary polygon
          */
        var circ = 40000.0e3; // Circumference of earth in meters.
        var latResDegrees = 360.0 * (resMeters / 40000000.0);
        var lonResDegrees = latResDegrees / Math.cos(latMin*Math.PI/180.0);
        
        var nLat = Math.ceil((latMax - latMin) / latResDegrees);
        var nLon = Math.ceil((lonMax - lonMin) / lonResDegrees);

        var temp_grid = [];
        for (var lat=latMin; lat<latMax; lat+=latResDegrees) {
          for (var lon=lonMin; lon<lonMax; lon+=lonResDegrees) {
            temp_grid.push(new Point(lat, lon));
          }
        }
                
        var resultCollection = [];
                
        temp_grid.forEach(function(pt) {
            
            if (pointInside(vertexes, pt)) {
                  
                var loc = new Location(pt.x, pt.y, 0.0);
                
                var alt = interpolateAltitude(measurements, loc);
                loc.alt = alt;
                
                resultCollection.push(loc);
              }
        });
        return resultCollection;        
    };
    
    /**
     * Calculates a spreader map.
     * 
     * @param paddock           The paddock that this spreader map is calculated for.
     * @param polygon           The Location objects that define the 
     *                          corners of the paddock.
     * @param measurements      A sample of recent pasture measurements taken from the
     *                          paddock.
     * @param resMeters         The spreader map resolution.
     */
    var calculateSpreaderMap = function(paddock, polygon, measurements, resMeters) {

        /** 
         * TODO If a paddock does not have a boundary, throw an error asking the user
         * to add a boundary to the paddock.
         */
        
        /**
         * Step 1: If the altitude of each corner point is not specified
         * then the altitude of the nearest measurement should be used.
         */
        var boundary = [];

        polygon.forEach(function(corner) {
          var alt = corner.altitude? corner.altitude : interpolateAltitude(measurements, corner);
          boundary.push(new Location(corner.lat, corner.lon, alt));
        });

        /**
         * Step 2: Calculate a grid for the paddock at the required resolution.
         */
        var grid = calculateGrid(paddock, boundary, measurements, resMeters);
                
        /**
         * Step 3: Calculate Variable Rate Spreader Map at each grid point
         */        
         var spreaderMap = [];
         grid.forEach(function(grid_pt) {
           
            var meas = closestMeasurement(measurements, grid_pt);
            var mapVal = 1.0 / (meas.length + 0.1);
            
            spreaderMap.push(new SpreaderMapPoint(grid_pt.lat, grid_pt.lon, grid_pt.alt, mapVal));            
          });

          return spreaderMap;       
    };
        
    return {
        calculateSpreaderMap: calculateSpreaderMap
    };
})();