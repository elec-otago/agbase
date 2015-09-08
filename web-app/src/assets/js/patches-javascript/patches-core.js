/*
 patches-core.js

 Copyright (c) 2015. Elec Research.
 
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/
 
 Author: Richard Norton.
*/

// Initialize patches object
function Patches() {
	this.origin = null;
	this.boundingbox = null;
	this.boundary = null;
	this.sites = null;
	this.triangles = null;
	this.cells = null;
	this.fdata = null;
	this.fvals = null;
	this.output = null;
    }

// add reset function to patches object
// set all attributes to empty arrays
Patches.prototype.reset = function() {
	this.origin = null;
	this.boundingbox = null;
	this.boundary = [];
	this.sites = [];    
	this.triangles = [];
	this.cells = [];
	this.fdata = [];	
	this.fvals = [];
	this.output = [];
    };

Patches.prototype.EPSILON = 1.0/1048576.0;
Patches.prototype.EARTHRADIUS = 6371009;	// in metres

// -------------------------------------------------------
// CONVERSION FUNCTIONS
// ----------------------------------------------------------

// scaling factors for longitude and latitude (eg. 1 degree of longitude = sx, 1 degree of latitude = sy)
Patches.prototype.scalefactors = function(origin) {
	var R = this.EARTHRADIUS,k = Math.PI/180;
	return {x: R*k*Math.abs(Math.cos(k*origin.lat)), y: R*k};
};

// convert latitude and longitude coordinates into x and y coordinates (in metres, relative to origin)
Patches.prototype.convertcoordinates2site = function(lon,lat) {
	var ox = this.origin.lon,
		oy = this.origin.lat,
		s = this.scalefactors(this.origin);
	return {x: s.x*(lon-ox), y: s.y*(lat-oy)};
};

// convert x and y coordinates into latitude and longitude
Patches.prototype.convertsite2coordinates = function(site) {
	var ox = this.origin.lon,
		oy = this.origin.lat,
		s = this.scalefactors(this.origin);
	return {lon: site.x/s.x + ox, lat: site.y/s.y + oy};
	};

// convert paddock geoJSON polygon into sites (metres)
// need to have run createbbandorigin(polygon) before
// input: polygon with coordinates ordered CLOCKWISE
// output: sites ordered ANTI-CLOCKWISE
Patches.prototype.convertgeoJSONpolygon2sites = function(polygon) {
	var vx,vy,v,
		sites = [],
		i = polygon.coordinates.length-1;
	
	//i = this.boundary.length - 1;
	while(i--) {
            //console.log(i);
		vx = polygon.coordinates[i][0];
		vy = polygon.coordinates[i][1];
		v = this.convertcoordinates2site(vx,vy);
		sites.push(v);
		}
	return sites;
	};

// convert paddock geoJSON polygon into sites (relative to origin)
// need to have run createbbandorigin(polygon) before
Patches.prototype.convertvramapdata2fdata = function(vramapdata) {
	var i,vx,vy,f,v,
		fdata = [],
		n = vramapdata.length;
	
	for(i=0;i<n;i++) {
		vx = vramapdata[i].lon;
		vy = vramapdata[i].lat;
		v = this.convertcoordinates2site(vx,vy);
		f = vramapdata[i].concentration;
		fdata.push({x:v.x, y:v.y, f:f});
		}
	return fdata;
	};

// convert sites into JSONpolygon
// input for each polygon is ordered ANTI-CLOCKWISE
// output for each polygon is ordered CLOCKWISE
Patches.prototype.convertsites2polygon = function(sites) {
	var polygon,vx,vy,v,i,
		n = sites.length;
	polygon = {"type": "polygon", "coordinates" : []};
	i = n;
	while(i--) {
		v = this.convertsite2coordinates(sites[i]);
		polygon.coordinates.push([v.lon,v.lat]);		
		}
	v = this.convertsite2coordinates(sites[n-1]);
	polygon.coordinates.push([v.lon,v.lat]);		
	return polygon;
	};

// ----------------------------------------------------------
// CREATION FUNCTIONS
// ----------------------------------------------------------

// create bounding box (in metres) and origin (latitude and longitude at bottom left corner of bounding box)
// input: JSON polygon
Patches.prototype.createbbandorigin = function(polygon) {
	var i,n,latmin,latmax,lonmin,lonmax,lat,lon,vmin,vmax;
	// find coordinates for bounding box as max/min of lat/lon of polygon	
	latmin = Number.POSITIVE_INFINITY;
	latmax =-Number.POSITIVE_INFINITY;
	lonmin = Number.POSITIVE_INFINITY;
	lonmax =-Number.POSITIVE_INFINITY;
	n = polygon.coordinates.length-1;
	for(i=0; i<n; i++) {
		lon = polygon.coordinates[i][0];
		lat = polygon.coordinates[i][1];
		if(lon<lonmin){lonmin = lon;}
		if(lon>lonmax){lonmax = lon;}
		if(lat<latmin){latmin = lat;}
		if(lat>latmax){latmax = lat;}
		}
	
	this.origin = {lon: lonmin, lat: latmin};
	vmin = this.convertcoordinates2site(lonmin,latmin);
	vmax = this.convertcoordinates2site(lonmax,latmax);
	this.boundingbox = {xmin: vmin.x, xmax: vmax.x, ymin: vmin.y, ymax: vmax.y};
	};

// create boundary by copying first n sites to boundary
Patches.prototype.createboundary = function(sites,n) {
	var i,site;
	this.boundary = [];
	for(i=0; i<n; i++) {
		site = sites[i];
		this.boundary.push(site);
		}
	};

// write sites to patches object
Patches.prototype.createsites = function(sites) {
	var i,site,n = sites.length;	
	this.sites = [];
	for(i=0; i<n; i++) {
		site = sites[i];
		this.sites.push(site);
		}
	};

// write fgrid to patches object
Patches.prototype.createfdata = function(fdata) {
	var i,fp,n = fdata.length;	
	this.fdata = [];
	for(i=0; i<n; i++) {
		fp = fdata[i];
		this.fdata.push({x:fp.x, y:fp.y, f:fp.f});
		}
	};

// create sites at max and min of fdata = {x: , y:, f: }
Patches.prototype.maxminSites = function(sites,fdata) {
	var i,imin,imax,fmax,fmin;
	fmax = -Infinity;
	fmin = Infinity;
	// find index of max and min of fdata
	for(i=0;i<fdata.length;i++) {
		if( fdata[i].f < fmin){ fmin = fdata[i].f; imin = i; }
		if( fdata[i].f > fmax){ fmax = fdata[i].f; imax = i; }
		} 
	// add max and min to sites
	sites.push({x: fdata[imax].x, y: fdata[imax].y});
	sites.push({x: fdata[imin].x, y: fdata[imin].y});
	return sites;	
	};

// create n additional random sites inside boundary
Patches.prototype.randomSites = function(sites,n) {

    var i,j,
	xmin = this.boundingbox.xmin,
	xmax = this.boundingbox.xmax,
	ymin = this.boundingbox.ymin,
	ymax = this.boundingbox.ymax,
	x,y,d,v;
		
    // create random vertices inside boundary
    // first create random vertices in bounding box for boundary,
    // then reject if outside boundary
	j=0;
    for (i=0; i<10000; i++) {

        if(j==n){break;}

        x = xmin + Math.random()*(xmax-xmin);
	y = ymin + Math.random()*(ymax-ymin);
	v = {x:x,y:y};
	
        d = this.signdistance2boundary(v,this.boundary);
	if(d<0) {
            sites.push({x:x,y:y});
            j+=1;
        }
    }
    //this.createsites(sites);
    return sites;
};

// Assign attributes to a cell
Patches.prototype.Cell = function(site,vertices,csites) {
    this.site = site;
    this.vertices = vertices;
	this.csites = csites;	
    };

// Create array of geoJSON polygons from cells
// input for each polygon is ANTI-CLOCKWISE
// output for each polygon is CLOCKWISE
Patches.prototype.createoutputpolygons = function(cells) {
	var i,j,nCells,nCell,v,polygon;
	this.output = [];
	nCells = cells.length;	
	for(i=0;i<nCells;i++){ 
		// construct geoJSONpolygon from cells[i]
		polygon = this.convertsites2polygon(cells[i].vertices);
		this.output.push({polygon : polygon});		
		}
    };

// Create array of geoJSON polygons from cells and attach fvals
Patches.prototype.createoutputpolygonswithfvals = function(cells,fvals) {
    var i,nCells=cells.length;
    this.createoutputpolygons(cells); // create array of geoJSON polygons, store in this.output
    
    for(i=0;i<nCells;i++){ 
        this.output[i].concentration = fvals[i];// attach fvals to array
    }
};

// -----------------------------------------------------------------------
// GEOMETRY FUNCTIONS
// -----------------------------------------------------------------------

// vp,va,vb etc. are vertices with coordinates vp.x and vp.y

// signed distance to a line, negative if vp is to the left
Patches.prototype.signdistance2line = function(vp,va,vb) {
    var ab0,ab1,ablength,ap0,ap1,d;
    ab0 = vb.x-va.x;
    ab1 = vb.y-va.y;
    ablength = Math.sqrt( ab0*ab0 + ab1*ab1 );
    ap0 = vp.x-va.x;
    ap1 = vp.y-va.y;
    d = (ap0*ab1 - ap1*ab0)/ablength;	
    return d;
};

// if q is point on line x=a+t(b-a) closest to vp then tq is corresponding t
// tq is between 0 and 1 if q is between points a and b
Patches.prototype.tq = function(vp,va,vb) {
    var ab0,ab1,ablength2,ap0,ap1,t;
    ab0 = vb.x-va.x;
    ab1 = vb.y-va.y;
    ablength2 = ab0*ab0 + ab1*ab1;
    ap0 = vp.x-va.x;
    ap1 = vp.y-va.y;
    t = (ap0*ab0 + ap1*ab1)/ablength2;	// t for closest point on line x=a+t(b-a)
    return t;
};

// distance between points p and q
Patches.prototype.distance2point = function(vp,vq) {
    var pq0,pq1,d;
    pq0 = vq.x-vp.x;
    pq1 = vq.y-vp.y;
    d = Math.sqrt( pq0*pq0 + pq1*pq1 );
    return d;
};

// signed distance from point p to line segment between a and b.
// negative sign is to the left of a to b
Patches.prototype.signdistance2linesegment = function(vp,va,vb) {
    var t,d,sgn;
    t = this.tq(vp,va,vb);                      // t for closest point on line x=a+t(b-a)
    d = this.signdistance2line(vp,va,vb);       // signed distance to line
    sgn = Math.sign(d);                         // sign of distance to line
    if(t < 0) { d = sgn*this.distance2point(vp,va);}
    else if(t > 1) {d = sgn*this.distance2point(vp,vb);}
    return d;
};

// signed distance from point p to boundary, negative if inside.
Patches.prototype.signdistance2boundary = function(vp,boundary) {
    var d,dp,i,va,vb,
    n = boundary.length;
    va = boundary[n-1];
    vb = boundary[0];
    d = this.signdistance2linesegment(vp,va,vb);
    for(i=1;i<n;i++) {
        va = boundary[i-1];
        vb = boundary[i];
        dp = this.signdistance2linesegment(vp,va,vb);
        if (Math.abs(dp)<Math.abs(d)) {d = dp;}
    }
    return d;	
};

// returns closest point to vp on line segment
Patches.prototype.closestpoint2linesegment = function(vp,va,vb) {
    var t,v;
    t = this.tq(vp,va,vb);    // t for closest point on line x=a+t(b-a)
    if(t < 0) {	return va;}
    else if(t > 1) {return vb;}
    else { return {x: va.x + t*(vb.x-va.x), y: va.y + t*(vb.y-va.y)}; }
};

// returns closest point to vp on boundary
Patches.prototype.closestpoint2boundary = function(vp,boundary) {
    var d,dp,i,j,va,vb,v,
    n = boundary.length;
    d = Number.POSITIVE_INFINITY;
    for(i=0;i<n;i++) {
        j = (i+1) % n;
        va = boundary[i];
        vb = boundary[j];
        dp = this.signdistance2linesegment(vp,va,vb);
        if (Math.abs(dp)<Math.abs(d)) {
            d = dp;
            v = this.closestpoint2linesegment(vp,va,vb);
        }
    }
    return v;
};

// calculate midpoint between points va and vb
Patches.prototype.midpoint = function(va,vb) {
    return {x: (va.x+vb.x)/2, y: (va.y+vb.y)/2};
};

// returns centroid of triangle with vertices vertices[i], vertices[j] and vertices[k]
Patches.prototype.centroid = function(vertices,i,j,k) {
    var vi,vj,vk,cx,cy;
    vi = vertices[i];
    vj = vertices[j];
    vk = vertices[k];
    cx = (vi.x + vj.x + vk.x)/3;
    cy = (vi.y + vj.y + vk.y)/3;
    return {x: cx, y: cy};
};

// returns angle of line from va to vb
Patches.prototype.lineangle = function(va,vb) {
    return Math.atan2(vb.y-va.y, vb.x-va.x);
};

// find triangles that have iSite as a corner
Patches.prototype.findtriangles = function(iSite) {
    var i,tri,tria = [];
    for(i=0; i<this.triangles.length; i++) {
        tri = this.triangles[i];
        if ( iSite==tri.i || iSite==tri.j || iSite==tri.k ){tria.push(i);}
    }
    return tria;
};

// distances to connected sites
Patches.prototype.distances2connectedsites = function() {
    var cells=this.cells,cell,site,csites,d2sites=[],i,j,v,
    sites=this.sites;

    for(i=0;i<cells.length;i++) {
        site = cells[i].site;
        csites = cells[i].csites;
        d2sites[i] = [];
        for(j=0;j<csites.length;j++) {
            v = sites[csites[j]];
            d2sites[i][j] = this.distance2point(site,v);
        }
    }
    return d2sites;
};

// find which cell a point lies in
Patches.prototype.findcell = function(point) {
    var i,cell,ii=0,dp,
    d = Infinity;
    for(i=0; i<this.cells.length; i++) {
        cell = this.cells[i];
        dp = this.signdistance2boundary(point,cell.vertices);
        if(dp < d){	d = dp; ii = i;}
    }
    return ii;
};

// find which points lie in a cell
Patches.prototype.findpoints = function(cell) {
    var i,fpoint,v,indices = [],d;
    for(i=0; i<this.fdata.length; i++) {
        fpoint = this.fdata[i];
        v = {x:fpoint.x, y:fpoint.y};
        // is fpoint in cell?
        d = this.signdistance2boundary(v,cell.vertices);
        if(d<0){ indices.push(i); }
    }
    return indices;
};

// find nearest point to a cell
Patches.prototype.findnearestpoint = function(cell) {
	var i,fpoint,v,ii=0,dp,
	d=Infinity;
	for(i=0; i<this.fdata.length; i++) {
		fpoint = this.fdata[i];
		v = {x:fpoint.x, y:fpoint.y};
		dp = this.signdistance2boundary(v,cell.vertices);
        if(dp<d){ d = dp; ii = i;}
	}
	return ii;
};

// --------------------------------------------------------
// OTHER USEFUL FUNCTIONS
// --------------------------------------------------------
// scales a vertex v by k
Patches.prototype.scalevertex = function(k,v) {
    return {x: k*v.x, y: k*v.y};
};

// va-vb
Patches.prototype.subtractvertices = function(va,vb) {
    return {x: va.x-vb.x, y: va.y-vb.y};
};

// va+vb
Patches.prototype.addvertices = function(va,vb) {
    return {x: va.x+vb.x, y: va.y+vb.y};
};

// sqrt of sum of squared entries of a double array, aka the Frobenius norm of a double array
Patches.prototype.frobeniusnorm = function(dd) {
    var i,j,s=0,d;
    i = dd.length;
    while(i--) {
        j = dd[i].length;
        while(j--) {
            d = dd[i][j];
            s += d*d;
        }
    }
    return Math.sqrt(s);
};

// Explicitly copy sites, since '=' in javascript does not always overwrite.
Patches.prototype.copysites = function(sites) {
    var i,n=sites.length,sites2 = [];
    for(i=0;i<n;i++){
        sites2.push({x: sites[i].x, y: sites[i].y});
    }
    return sites2;
};



// --------------------------------------------------------
// DELAUNAY TRIANGULATION FUNCTIONS
// --------------------------------------------------------
// this bit is based on code at
// https://github.com/ironwallaby/delaunay
// ironwallaby has 'To the extent possible by law, 
// I have waived all copyright and related or neighboring 
// rights to this library.'

Patches.prototype.supertriangle = function(vertices) {
    var xmin = Number.POSITIVE_INFINITY,
        ymin = Number.POSITIVE_INFINITY,
        xmax = Number.NEGATIVE_INFINITY,
        ymax = Number.NEGATIVE_INFINITY,
        i, dx, dy, dmax, xmid, ymid;

    for(i = vertices.length; i--; ) {
      if(vertices[i].x < xmin) { xmin = vertices[i].x; }
      if(vertices[i].x > xmax) { xmax = vertices[i].x; }
      if(vertices[i].y < ymin) { ymin = vertices[i].y; }
      if(vertices[i].y > ymax) { ymax = vertices[i].y; }
    }

    dx = xmax - xmin;
    dy = ymax - ymin;
    dmax = Math.max(dx, dy);
    xmid = xmin + dx * 0.5;
    ymid = ymin + dy * 0.5;

    return [
      [xmid - 20 * dmax, ymid -      dmax],
      [xmid            , ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid -      dmax]
    ];
};

Patches.prototype.circumcircle = function(vertices, i, j, k) {
    var EPSILON = this.EPSILON, 
        x1 = vertices[i].x,
        y1 = vertices[i].y,
        x2 = vertices[j].x,
        y2 = vertices[j].y,
        x3 = vertices[k].x,
        y3 = vertices[k].y,
        fabsy1y2 = Math.abs(y1 - y2),
        fabsy2y3 = Math.abs(y2 - y3),
        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON) { throw new Error("Eek! Coincident points!"); }
    
    if(fabsy1y2 < EPSILON) {
        m2  = -((x3 - x2) / (y3 - y2));
        mx2 = (x2 + x3) / 2.0;
        my2 = (y2 + y3) / 2.0;
        xc  = (x2 + x1) / 2.0;
        yc  = m2 * (xc - mx2) + my2;
    }
    else if(fabsy2y3 < EPSILON) {
        m1  = -((x2 - x1) / (y2 - y1));
        mx1 = (x1 + x2) / 2.0;
        my1 = (y1 + y2) / 2.0;
        xc  = (x3 + x2) / 2.0;
        yc  = m1 * (xc - mx1) + my1;
    }
    else {
        m1  = -((x2 - x1) / (y2 - y1));
        m2  = -((x3 - x2) / (y3 - y2));
        mx1 = (x1 + x2) / 2.0;
        mx2 = (x2 + x3) / 2.0;
        my1 = (y1 + y2) / 2.0;
        my2 = (y2 + y3) / 2.0;
        xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
        yc  = (fabsy1y2 > fabsy2y3) ?
        m1 * (xc - mx1) + my1 :
        m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;
    return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy};
};

// use for removing doubled up edges
Patches.prototype.dedup = function(edges) {
    var i, j, a, b, m, n;

    for(j = edges.length; j; ) {
        b = edges[--j];
        a = edges[--j];

        for(i = j; i; ) {
            n = edges[--i];
            m = edges[--i];

            if((a === m && b === n) || (a === n && b === m)) {
                edges.splice(j, 2);
                edges.splice(i, 2);
                break;
            }
        }
    }
};

// compute Delaunay triangulation given sites.
Patches.prototype.triangulate = function(sites) {

    var vertices = sites;
    var n = vertices.length,
        EPSILON = this.EPSILON,
        i, j, indices, st, open, closed, edges, dx, dy, a, b, c, d, ii, jj, kk,
        vertices2, ai, bi;
    var aSort = function(a1, a2) { return a1.angle - a2.angle; };       
    /* Bail if there aren't enough vertices to form any triangles. */
    if(n < 3) {return [];}

    /* Slice out the actual vertices from the passed objects. (Duplicate the
     * array even if we don't, though, since we need to make a supertriangle
     * later on!) */
    vertices2 = vertices.slice(0);

    /* Make an array of indices into the vertex array, sorted by the
     * vertices' x-position. */
    indices = new Array(n);
    for(i = n; i--; ){ indices[i] = i;}

    indices.sort(function(i, j) {return vertices2[j].x - vertices2[i].x;});

    /* Next, find the vertices of the supertriangle (which contains all other
     * triangles), and append them onto the end of a (copy of) the vertex
     * array. */
    st = this.supertriangle(vertices2);
    vertices2.push({x:st[0][0],y:st[0][1]});
    vertices2.push({x:st[1][0],y:st[1][1]});
    vertices2.push({x:st[2][0],y:st[2][1]});

    /* Initialize the open list (containing the supertriangle and nothing
     * else) and the closed list (which is empty since we havn't processed
     * any triangles yet). */
    open   = [this.circumcircle(vertices2, n + 0, n + 1, n + 2)];
    closed = [];
    edges  = [];

    /* Incrementally add each vertex to the mesh. */
    for(i = indices.length; i--; edges.length = 0) {
        c = indices[i];

        /* For each open triangle, check to see if the current point is
         * inside it's circumcircle. If it is, remove the triangle and add
         * it's edges to an edge list. */
        for(j = open.length; j--; ) {
            /* If this point is to the right of this triangle's circumcircle,
             * then this triangle should never get checked again. Remove it
             * from the open list, add it to the closed list, and skip. */
            dx = vertices2[c].x - open[j].x;
            if(dx > 0.0 && dx * dx > open[j].r) {
                closed.push(open[j]);
                open.splice(j, 1);
                continue;
            }

            /* If we're outside the circumcircle, skip this triangle. */
            dy = vertices2[c].y - open[j].y;
            if(dx*dx + dy*dy - open[j].r > EPSILON) {continue;}
          
            /* Remove the triangle and add it's edges to the edge list. */
            edges.push(
                open[j].i, open[j].j,
                open[j].j, open[j].k,
                open[j].k, open[j].i
            );
            open.splice(j, 1);           
        }
        /* Remove any doubled edges. */
        this.dedup(edges);

        /* Add a new triangle for each edge. */
        for(j = edges.length; j; ) {
            b = edges[--j];
            a = edges[--j];
            open.push(this.circumcircle(vertices2, a, b, c));
        }
    }

    /* Copy any remaining open triangles to the closed list, and then
     * remove any triangles that share a vertex with the supertriangle,
     * building a list of triplets that represent triangles. */
    // Do not add triangles with centroid outside boundary.
    // Add indices in anti-clockwise direction around centroid
    for(i = open.length; i--; ){ closed.push(open[i]); }
    open.length = 0;

    this.triangles = [];
    
    for(i = closed.length; i--; ) {

        ii = closed[i].i;
        jj = closed[i].j;
        kk = closed[i].k;
        if(ii < n && jj < n && kk < n) {
            c = this.centroid(vertices,ii,jj,kk);
            d = this.signdistance2boundary(c,this.boundary);
            if (d < EPSILON) {
                ai = [ {i:ii, angle: this.lineangle(c,vertices[ii])}, 
                    {i:jj, angle: this.lineangle(c,vertices[jj])}, 
                    {i:kk, angle: this.lineangle(c,vertices[kk])} ];                
                ai.sort(aSort);
                this.triangles.push({i:ai[0].i, j:ai[1].i, k:ai[2].i});
            }
        }
    }
};

// --------------------------------------------------------------------------
// MAIN COMPUTE FUNCTIONS
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// COMPUTE CELLS
// --------------------------------------------------------------------------
// after specifying this.sites, compute cells
Patches.prototype.computeCells = function() {

    var sites,iSite,cell,site,i,j,k,c,tris,tris2,tri,angs,cens,vertices,tri1,tri2,iSite1,iSite2,csites;
    var sortFunction = function(iii, jjj) { return iii.angle - jjj.angle; };
    sites = this.sites;	
    this.triangulate(sites);
    this.cells = [];
    for(iSite=0; iSite<sites.length; iSite++) {
        site = sites[iSite];
        tris = this.findtriangles(iSite); // find triangles connected to site, store indices in array
        tris2 = [];
        cens = [];
        vertices = [];
        csites = [];
        for(j=0; j<tris.length; j++) { // find angles of centroids of triangles connected to site
            tri = this.triangles[tris[j]];
            c = this.centroid(sites,tri.i,tri.j,tri.k);
            angs = this.lineangle(site,c);
            tris2[j] = {i:tris[j], angle:angs};
            cens[j] = {c:c, angle:angs};
        }
        
        tris2.sort(sortFunction); // sort tris according to angle
        cens.sort(sortFunction); // sort cens according to angle

        // define vertices of cell
        vertices.push(cens[0].c); // first vertex of cell
        for(j=0; j<tris.length; j++) {
            k = (j+1) % tris2.length;
            tri1 = this.triangles[tris2[j].i];
            tri2 = this.triangles[tris2[k].i];

            if(iSite == tri1.i) {iSite1 = tri1.k;} // iSite1 is other corner of tri1 on boundary
            if(iSite == tri1.j) {iSite1 = tri1.i;}
            if(iSite == tri1.k) {iSite1 = tri1.j;}

            if(iSite == tri2.i) {iSite2 = tri2.j;} // iSite2 is other corner of tri2 on boundary
            if(iSite == tri2.j) {iSite2 = tri2.k;}
            if(iSite == tri2.k) {iSite2 = tri2.i;}

            // add next vertex to vertices, if triangles connected then just add one vertex,
            // otherwise treat the triangles as part of the boundary and add vertex to mid-point of edge, site, and mid-point of next edge.
            // Also keep references to connected sites.
            if(iSite1 == iSite2) {
                vertices.push(cens[k].c);
                csites.push(iSite1);
            }
            else {
                vertices.push(this.midpoint(site,sites[iSite1]));
                vertices.push(site);
                vertices.push(this.midpoint(site,sites[iSite2]));
                vertices.push(cens[k].c);
                csites.push(iSite1);
                csites.push(iSite2);
            }
        }
        vertices = vertices.slice(0,-1);// remove last, repeated index of vertices
        this.cells[iSite] = new this.Cell(site,vertices,csites); // store site and vertices, and list of sites connected to site
    }

    // create array of geoJSON polygons
    // this.output[i].polygon is a geoJSON polygon
    // will add function values to each polygon later to get
    this.createoutputpolygons(this.cells);
};

// --------------------------------------------------------------------------
// RELAX CELLS 
// --------------------------------------------------------------------------
// relax sites by moving them away from neighbours
// boundary sites are fixed
Patches.prototype.relaxSites = function(m,dt,nfixed) {
// input:
//         m:    number of relaxation steps to take
//        dt:    time step
//    nfixed:    number of fixed sites (first nfixed sites are fixed)
    var sites,cells,nCell,nboundary,i,j,cell,site,csites,ncsites,dc,dcnorm,d,dc0,hnorm,v,direction,force,k,h,
    Fscale=1.2; 

    sites = this.sites;
    while(m--) {
        cells = this.cells;
        //sites = this.sites;
        nCell = cells.length;
        nboundary = this.boundary.length;
        force = [];
       
        // compute distances to connected sites
        dc = this.distances2connectedsites();
        dcnorm = this.frobeniusnorm(dc);		
        // could replace h=1 with a non-constant function for non-uniform mesh
        h = 1;
        hnorm = 0;
        for(i=0;i<dc.length;i++){ 
            for(j=0;j<dc[i].length;j++) {
                hnorm += h*h;
            }
        }
        hnorm = Math.sqrt(hnorm);	
        // compute force acting on each non-fixed site
        for(i=nfixed;i<nCell;i++){ 
            cell = cells[i];
            site = cell.site;	
            csites = cell.csites;
            force[i] = {x:0,y:0};
            for(j=0;j<csites.length;j++) {
                d = dc[i][j];
                dc0 = Fscale*h*dcnorm/hnorm;
                v = sites[csites[j]];
                direction = this.subtractvertices(site,v);
                k = Math.max(dc0-d,0)/d;
                v = this.scalevertex(k,direction);
                force[i] = {x: force[i].x+v.x, y: force[i].y+v.y}; 
            }
        }
        // move each non-fixed site by dt*force
        for(i=nfixed;i<nCell;i++){
            site = sites[i];
            v = this.scalevertex(dt,force[i]);
            site = this.addvertices(site,v);
            sites[i] = site;
        }
        // project sites outside boundary back onto boundary
        for(i=nfixed;i<nCell;i++){ 
            site = sites[i];
            d = this.signdistance2boundary(site,this.boundary); // distance to boundary
            if (d>0) { // d>0 == site is outside boundary
                site = this.closestpoint2boundary(site,this.boundary);
                sites[i] = site;
            }
        }
        this.createsites(sites);
        this.computeCells();
    }
};

// --------------------------------------------------------------------------
// COMPUTE FUNCTION VALUES  
// --------------------------------------------------------------------------

// Compute fvals by taking average of fdata in each cell
Patches.prototype.computefvals = function() {
    var i,j,np,d,fsum,indices,
    fdata=this.fdata,
    nCells=this.cells.length;

    this.fvals = [];
    for(j=0;j<nCells;j++) {
        cell = this.cells[j];	 
        indices = this.findpoints(cell); // find data/grid points in cell
        fsum = 0;
        np = 1;
        if( indices.length > 0.5){
            np = indices.length;
            for(i=0;i<np;i++) {
                fsum += fdata[indices[i]].f;
            }
        } else {
		// if cell has no grid points, then set fsum = fdata(nearest grid point)
			indices = this.findnearestpoint(cell);
			fsum = fdata[indices].f;
		}
        this.fvals[j] = fsum/np;
    }   
};

// --------------------------------------------------------------------------
// OPTIMIZATION 
// --------------------------------------------------------------------------

// define cost function to be optimized.
Patches.prototype.costfunction = function(sites) {
    var c,dc,dcnorm,dc0,h,hnorm,i,j,Fscale=1.2,v,fpoint,diff,fvals,meshpenalty,residual2,lambda;
    fdata = this.fdata;

    // define weighting of meshpenalty
    lambda = 0.000001;

    this.createsites(sites);
    this.computeCells();
    this.computefvals();
    fvals = this.fvals;
    // compute distances to connected sites
    dc = this.distances2connectedsites();
    dcnorm = this.frobeniusnorm(dc);
    // could replace h=1 with a non-constant function for non-uniform mesh
    h = 1;
    hnorm = 0;
    for(i=0;i<dc.length;i++){ 
        for(j=0;j<dc[i].length;j++) {
            hnorm += h*h;
        }
    }
    hnorm = Math.sqrt(hnorm);	
    dc0 = Fscale*h*dcnorm/hnorm;	// desired distance between sites, multiplied by Fscale=1.2
    // array of max(dc0-dc,0)
    for(i=0;i<dc.length;i++){ 
        for(j=0;j<dc[i].length;j++) {
            dc[i][j] = Math.max(dc0-dc[i][j],0);
        }
    }
    meshpenalty = this.frobeniusnorm(dc);  

    residual2 = 0;
    for(i=0;i<fdata.length;i++){
        // find index to cell that contains point
        fpoint = fdata[i];
        v = {x: fpoint.x, y: fpoint.y};
        j = this.findcell(v);
        diff = fvals[j]-fpoint.f;
        residual2 += diff*diff;		// add contribution to residual;
    }
    //c = meshpenalty*meshpenalty;
    //c = residual2;
    c = residual2 + lambda*meshpenalty*meshpenalty;
    return c;
};

Patches.prototype.costpoint = function(x,params) {
	// function to compute cost of non-optimal fertilizer application
	// at a grid point.  Output is in dollars per m^2
	var grasscost, fertcost, runoffcost, q1, q2, q3,
		c = params.c,
		p = params.p,
		k = params.k,
		r = params.r;
		
	q1 = c + 0.5 *p/k;
	q2 = c + 0.25*p/k;
	q3 = x - q1;

	// grass cost
	if (x<q1) {
		grasscost = k*Math.pow(q3,2) - p*q2;
	} else {
		grasscost = -p*q2;
	}

	// fertilizer cost
	fertcost = p*x;

	// runoff cost
	if (x<q1) {
		runoffcost = 0.0;
	} else {
		runoffcost = r*q3
	}
	return grasscost + fertcost + runoffcost;
};

// define cost function for loss due to non-optimal fertilizer application
Patches.prototype.costfunction2 = function(sites,params) {
	// sites : centers of patches
	// params : parameters for cost function (eg. params.p = price of fertilizer per m^2)
	
	// calculate cost per m^2 for each data point, 
	// then add together with weighting according to grid spacing (only really works with uniform grid of data)

	var i,j,totalcost,x,fpoint,v,area,
		ndata = this.fdata.length,
		fdata=this.fdata,
		fvals=this.fvals;
	
	area = Math.pow(params.resolution,2); // area (in m^2) per grid point

	totalcost = 0;
	for(i=0;i<ndata;i++) {
		fpoint = fdata[i];
		v = {x: fpoint.x, y: fpoint.y};
		j = this.findcell(v);
		x = fvals[j]; 			// find applied density at grid point
		x /= 10000.0;			// divide by 10000 to convert from kg per hectare to per m^2		

		params.c = fpoint.f; 	// optimal density at grid point
		params.c /= 10000.0;	// divide by 10000 to convert from kg per hectare to per m^2		

		pointcost = this.costpoint(x,params);	
		totalcost += pointcost*area;
	}
	
	return totalcost;
};

// Optimize cost function using this.sites as initial guess.
Patches.prototype.optimize = function(sites,n,r,nfixed) {
// input:
//      n = number of optimzation iterations to take
//      r = window size for proposal
    var c,i,j,d,cp,oldsites,fdata,oldfvals,fvals,ratio,
        nboundary = this.boundary.length;
    //sites = this.sites;
    //fdata = this.fdata; TODO: uncomment this line if needed 
    //var nSites = sites.length; TODO: see above todo

    // computeCells() and computefvals() here are probably redundant.
    this.createsites(sites);
    this.computeCells();
    this.computefvals();

    oldsites = this.copysites(sites); // copy sites incase we reject proposal
    c = this.costfunction(sites);
    for(i=0;i<n;i++) {
        // Move unfixed sites
        for(j=nfixed;j<sites.length;j++) {
            site = sites[j];
            // move site by random amount
            site.x += r*(Math.random()-0.5);
            site.y += r*(Math.random()-0.5);
            // project onto boundary if outsite
            d = this.signdistance2boundary(site,this.boundary); // distance to boundary
            if (d>0) {site = this.closestpoint2boundary(site,this.boundary);}
            sites[j] = site;
            cp = sites.length;
        }
        // if cost function grows then reject
        cp = this.costfunction(sites);
        ratio = c/cp;
        if (ratio<1){
            sites = this.copysites(oldsites); // reject proposal and go back to oldsites
        }
        else { 
           c = cp; 
           oldsites = this.copysites(sites);	// accept proposal and update
        }
    }
    this.createsites(sites);
    this.computeCells();
    this.computefvals();
    this.createoutputpolygonswithfvals(this.cells,this.fvals);
    //console.log(c);// report cost function to console
};

// -------------------------------------------------------
// DRIVER FUNCTIONS
// -------------------------------------------------------

// compute cells after specifying sites
Patches.prototype.computeFromPaddock = function(paddock,vramapdata,maxmin,n,costparams) {
// input:
//        paddock : geoJSON polygon defining corners of a paddock
//        vramapdata: array of VRA map points {lat: latitude, lon: longitude, concentration: XX}
//        maxmin : binary.  1=add fixed sites at max and min of data, 0=don't
//        n: number of additonal points insite paddock
// 		  costparams: parameters for computing cost function

    var sites,nboundary,fdata,c;
    this.createbbandorigin(paddock);
    sites = this.convertgeoJSONpolygon2sites(paddock);
    fdata = this.convertvramapdata2fdata(vramapdata);
    nboundary = paddock.coordinates.length-1;
    this.createboundary(sites,nboundary);	
    this.createfdata(fdata);
    if(maxmin == 1){ sites = this.maxminSites(sites,fdata); }	
    sites = this.randomSites(sites,n);
    this.createsites(sites);
    this.computeCells();
	this.computefvals();        

    c = this.costfunction2(this.sites,costparams);
    this.createoutputpolygonswithfvals(this.cells,this.fvals);	
	this.output.cost = c;	// append cost of suboptimal fertilizer application to output.
    return this.output;
};

// compute output by relaxing points (site location does not depend on vramapdata)
Patches.prototype.relaxdriverFromPaddock = function(paddock,vramapdata,maxmin,n,costparams) {
// input:
//          paddock : geoJSON polygon defining corners of a paddock
//          vramapdata : array of VRA map points {lat: latitude, lon: longitude, concentration: XX}
//          maxmin : binary.  1=add fixed sites at max and min of data, 0=don't	
//          n: number of additonal points insite paddock
// 			costparams: parameters for computing cost function
    
    var sites,nboundary,nfixed,fdata,c;
    this.createbbandorigin(paddock);
    sites = this.convertgeoJSONpolygon2sites(paddock);
    fdata = this.convertvramapdata2fdata(vramapdata);
    nboundary = paddock.coordinates.length-1;
    this.createboundary(sites,nboundary);	
    this.createfdata(fdata);
    nfixed = nboundary;
    if(maxmin == 1){ 
        sites = this.maxminSites(sites,fdata); 
        nfixed += 2;
    }
    sites = this.randomSites(sites,n);	
    this.createsites(sites);
    this.computeCells();

    //this.relaxSites(100*this.sites.length,0.1,nfixed); 
	this.relaxSites(100,0.1,nfixed);	// 1st argument is number of iterations, 2nd is size of time step, 3rd is no. of fixed sites
	this.computefvals();  
    
	c = this.costfunction2(this.sites,costparams);
    this.createoutputpolygonswithfvals(this.cells,this.fvals);	
	this.output.cost = c;	// append cost of suboptimal fertilizer application to output.
//	console.log(this.output.cost);
    return this.output;
};

// Optimization driver
Patches.prototype.optimizedriverFromPaddock = function(paddock,vramapdata,maxmin,n) {
// input:
//          paddock : geoJSON polygon defining corners of a paddock
//          vramapdata : array of VRA map points {lat: latitude, lon: longitude, concentration: XX}
//          maxmin : binary.  1=add fixed sites at max and min of data, 0=don't
//          n: number of additonal points insite paddock

    var sites,nboundary,fdata,c;
    this.createbbandorigin(paddock);
    sites = this.convertgeoJSONpolygon2sites(paddock);
    fdata = this.convertvramapdata2fdata(vramapdata);
    nboundary = paddock.coordinates.length-1;
    this.createboundary(sites,nboundary);	
    this.createfdata(fdata);
    nfixed = nboundary;
    if(maxmin == 1){ 
        sites = this.maxminSites(sites,fdata); 
        nfixed += 2;
    }
    sites = this.randomSites(sites,n);
    this.createsites(sites);
    this.optimize(this.sites,1000,10,nfixed); // first argument is number of iterations, second is size of proposal window

    // Optional few relaxation steps after optimization to push points to boundary... to get slightly nicer mesh
    //this.relaxSites(1,0.1,nfixed);	// first argument is number of iterations, second is size of time step
    //c = this.costfunction(this.sites);
    //console.log(c);

    this.createoutputpolygonswithfvals(this.cells,this.fvals);	
        return this.output;
    };

// --------------------------------------------------------
// FUNCTIONS ON OUTPUT (for rendering)
// --------------------------------------------------------

// max concentration value in output
Patches.prototype.rangeconcentration = function(output) {
    var i,fval,maxf=-Infinity,minf=Infinity;
    for(i=0;i<output.length;i++) {
        fval = output[i].concentration;
        if( fval>maxf ){ maxf = fval; }
        if( fval<minf ){ minf = fval; }
    }
    return {min: minf, max:maxf};
}; 


if ( typeof module !== 'undefined' ) {
    module.exports = Patches;
}


