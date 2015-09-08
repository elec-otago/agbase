To run, open demo1-relax.html or demo2-optimize.html in browser to run javascript.

The html in demo1-relax.html and demo2-optimize.html is based on voronoi code demo1 by rhill (i.e. not to be included in final version)

Triangulation of points is based on code by ironwallaby https://github.com/ironwallaby/delaunay.  No copyright issues as he waived his rights.  See his readme file.

Will get problems if paddock has longitude values ~180 and ~-180, or flat earth approximation not good.

Main functions for input and output:

Patches.computeFromPaddock(paddock,vramapdata,maxmin,n)
Patches.relaxdriverFromPaddock(paddock,vramapdata,maxmin,n)
Patches.optimizedriverFromPaddock(paddock,vramapdata,maxmin,n)

input:
 		paddock : geoJSON polygon defining corners of a paddock
 		vramapdata: array of VRA map points {lat: latitude, lon: longitude, concentration: XX}
 		maxmin : binary.  1=add fixed sites at max and min of data, 0=don't
		n 		: number of additonal points insite paddock

output: 
		an array of geoJSON polygons and a function value...
		eg. output[i] = {polygon: geoJSONpolygon, concentration: XX}

The value of the cost function is reported in the console

computeFromPaddock 

1. optionally creates fixed points at the max and min concentration of the vramapdata
2. creates n additional random points in the paddock
3. draws patches/cells without moving the original points
4. assigns a concentration value to each patch that is the mean of the data concentrations in that patch.  If no data concentrations in the patch then concentration is set to zero.

relaxdriverFromPaddock

same as computeFromPaddock except points are moved before assigning function values.  Repellant forces are introduced between neighbouring points if they are closer than 1.2 times the distance a uniform mesh would have.  Points are then moved by these forces, projecting points that leave the paddock onto the boundary.  This forces some points to the boundary and equally spaces the others.

optimizedriverFromPaddock

same as computeFromPaddock except points are moved to try and minimize a cost function.  The cost function is a combination of residual of the concentration function and a mesh penalty term for when points get too close.  The optimizer is a random walk, accepting if cost function decreases.

Opportunities for further development:

1. Supply a non-uniform mesh function h (i.e. so that forces between points depend on location)
2. Calculate concentration values differently.  For example, data points closer to centre of a patch could be more important.
3. We currently need forces to be 1.2 times the equal mesh distance to create positive pressure and force points to the boundary (which creates nice looking meshes).  Alternatively we could explicitly place points on the boundary
4. Use a better black-box optimzer
5. Write a routine for choosing n... eg. bound n by min { (Area of paddock)/(min desired area for a patch = 50m*50m = 2500m^2), 100}.  Since we have upper limit of 124 patches for shape file.
