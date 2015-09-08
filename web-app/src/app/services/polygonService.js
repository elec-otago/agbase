/**
 * Copyright 2000 softSurfer, 2012 Dan Sunday
 * This code may be freely used and modified for any purpose
 * providing that this copyright notice is included with it.
 * SoftSurfer makes no warranty for this code, and cannot be held
 * liable for any real or imagined damage resulting from its use.
 * Users of this code must verify correctness for their application.
 *
 * Translation to Javascript by Tim Molteno.
 * 
 * Creating a service here, following the tutorial...
 * 
 * http://viralpatel.net/blogs/angularjs-service-factory-tutorial/
 * */
appServices.factory('PolygonService', function() {

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

  
    //public functions
    return{
        pointInside: pointInside,
        Point: Point
    };
});
