var ShapeFileMaker = (function(my) {

    my.buildFromGeoJSON = function(geoJSON, dbSchema, dbRecords) {
                
        my.createDbFile(dbSchema, dbRecords);
        _createShapeFilesFromGeoJSON(geoJSON);
    };
    
    /**
     * Creates the main (.shp) and index (.shx) the shape files
     * 
     * @param geoJSON   either a single geojson object or an array of geojson
     *                  objects
     */
    var _createShapeFilesFromGeoJSON = function(geoJSON) {

        if(!geoJSON) { throw "geoJSON parameter is undefined"; }

        // check if the geoJSON parameter is an array of objects
        if(Object.prototype.toString.call( geoJSON ) != '[object Array]') {
            // if a single geo json object was given as a parameter,
            // put it in an array.
            geoJSON = [geoJSON];
        }
        else {

            // check that the types of geojson data in each object match
            var geoType = geoJSON[0].type;
            var typeMatch = false;

            for(var i = 1; i < geoJSON.length; i++) {
                
                typeMatch = geoType === geoJSON[i].type;
            }
            if(!typeMatch) { throw "geoJSON objects in array must have the same type"; }
        }

        switch(geoJSON[0].type) {

            case "Polygon":
            case "polygon":
               
                var polygons = [];
                geoJSON.forEach(function(obj) {
                    polygons.push(obj.coordinates);
                });
                my.createPolygonShapeFiles(polygons);
                break;

            case "Point":
            case "LineString":
            case "MultiPoint":
            case "MultiLineString":
            case "GeometryCollection":
                return null;
            default:
                return null;
        }        
    };

    return my;

}(ShapeFileMaker || {}));