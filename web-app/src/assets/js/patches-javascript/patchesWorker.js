/**
 * patchesWorker.js
 * 
 * Script used to  patches-core.js in a background thread
 * 
 * Author: Tim Miller
 */

/**
 * comparator function used to sort polygon coordinates in clockwise/counterclockwise
 * order.
 * function retrieved from http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
 */
var centerOfPoly;
var comparePoints = function(a, b) {

    var center = centerOfPoly;
        
    var x = 0;
    var y = 1;
        
    if(a[x] - center[x] >= 0 && b[x] - center[x] < 0) { return false; }
    if(a[x] - center[x] < 0 && b[x] - center[x] >= 0) { return true; }
    
    if(a[x] - center[x] === 0 && b[x] - center[x] === 0) {
        
        if(a[u] - center[y] >= 0 || b[y] - center[y] >= 0) { return a[y] < b[y]; }
        
        return b[y] < a[y];
    }
        
    // compute the cross product of vectors
    var det = (a[x] - center[x]) * (b[y] - center[y]) - (b[x] - center[x]) * (a[y] - center[y]);
        
    if(det < 0) { return false; }
    if(det > 0) { return true; }
        
    // points a and b are on the same line from the center
    // check which point is closer to the center
    var d1 = (a[x] - center[x]) * (a[x] - center[x]) + (a[y] - center[y]) * (a[y] - center[y]);
    var d2 = (b[x] - center[x]) * (b[x] - center[x]) + (b[y] - center[y]) * (b[y] - center[y]);
        
    return d1 > d2;
};    

/**
 * Organise an array of coordinates into a clock.
 * exterior = clockwise
 * interior = counter clockwise
 */
var arrangeRing = function(ring, isClockwise) {
                
    ring.splice(-1, 1);
        
    // calculate the center of all points 
    centerOfPoly = [0, 0];           
    ring.forEach(function(coord) {
            
        centerOfPoly[0] += coord[0];
        centerOfPoly[1] += coord[1];
    });
    centerOfPoly[0] = centerOfPoly[0] / ring.length;
    centerOfPoly[1] = centerOfPoly[1] / ring.length;
            
    ring.sort(comparePoints);
    ring.push(ring[0]);
    if(isClockwise === false) {
        ring.reverse();
    }
    return ring;
};

/**
 * Arranges paddock border coordinates in clockwise order and
 * converts them to geoJSON
 */
var convertPaddockCoordsToGeoJSON = function(paddock) {
      
    var rCoords = { coordinates: [] };
    
    paddock.loc.forEach(function(coordPair) {
       rCoords.coordinates.push([coordPair.lon, coordPair.lat]);
    });
    //close off polygon
    rCoords.coordinates.push( [ paddock.loc[0].lon, paddock.loc[0].lat ] );
        
    //arrange in clockwise order.
    rCoords.coordinates = ShapeFileMaker.arrangeRing(rCoords.coordinates, true);

    return rCoords;
};

/**
 * Creates a VRA map.
 */
var buildSpreaderMap = function(paddockCoords, vraMap, polygons, resolution) {
        
    var patches = new Patches();
    patches.reset();
    
	// parameters for cost function (that returns cost of sub-optimal fertilizer application)
	var costparams = {p:0.5, k:1, r:1, resolution:resolution};			
	// p: price of fertilizer per kg
	// k: slope parameter for cost function
	// r:slope parameter for runoff part of cost function       
	// resolution: distance between vraMap grid points in meters

    var output = patches.relaxdriverFromPaddock(paddockCoords, vraMap, 0, polygons, costparams);    
    return output;
};

onmessage = function(e) {

    importScripts('patches-core.js');
    importScripts('../ShapeFileMaker/ShapeFileMaker.js');

    var paddock = e.data.paddock;
    var vraMap = e.data.vraMap;
    var polygons = e.data.polygons;
    var resolution = e.data.resolution;
   
    //TODO: convert paddock coords to geoJSON before calling onmessage (IMPORTANT!!!!)
    var paddockCoords = convertPaddockCoordsToGeoJSON(paddock);
    var output = buildSpreaderMap(paddockCoords, vraMap, polygons, resolution);

    postMessage(output);
    close();
};
