/**
 * ShapeFileMaker.js
 * 
 * Gets coordinates and creates a Shapefile.
 * 
 * A Description of a Shapefile can be retrieved from
 * https://www.esri.com/library/whitepapers/pdfs/shapefile.pdf
 * 
 * Author: Tim Miller
 */

var ShapeFileMaker = (function(my) {
        
    var _mainFile;
    var _indexFile;
    var _dbFile;
    var _centerOfPoly;       // used to organize a polygon ring in clockwise/counter clockwise order.
    
    my.getMainFile = function() { return _mainFile; };
    my.getIndexFile = function() { return _indexFile; };
    my.getDBFile = function() { return _dbFile; };

    my.EShapeType = {
        NULL_SHAPE: 0,
        POINT: 1,
        POLYLINE: 3,
        POLYGON: 5
    };

    my.EDBAttributeTypes = {
        
        CHAR: 'C',
        DATE: 'D',
        NUMBER: 'N',
        LOGICAL: 'L'
    };

    /**
    * bounding box object
    */
    var BoundingBox = function(xMin, xMax, yMin, yMax) {

        this.xMin = xMin;
        this.xMax = xMax;

        this.yMin = yMin;
        this.yMax = yMax;
        
        this.zMin = null;
        this.zMax = null;

        this.mMin = null;
        this.mMax = null;
    };    
    
    my.downloadFiles = function(fileName) {        

        // throw error if any of the files are missing.
        if(!_mainFile  || !_indexFile || !_dbFile) {
            throw "shape files have not been created.";
        }
        
        var blobArr = [
            { name: fileName + ".shp", blob: _mainFile },
            { name: fileName + ".shx", blob: _indexFile },
            { name: fileName + ".dbf", blob: _dbFile }
        ];
        var bufferArr = [];
        var zipFileName = fileName + ".zip";
        
        _downloadZipFile(blobArr, bufferArr, zipFileName);
    };
    
    /**
     * Adds each blob in the blobArr parameter to a zip file, then calls 
     * downloadFile with the zip file as a parameter.  On each pass of this 
     * function, the length of the blobArr array is checked.  If it is empty,
     * a zip file is generated with the contents of the bufferArr array, then
     * downloadFile is called with the zip file.
     * 
     * @param blobArr       An array of blob objects to be turned into array 
     *                      buffer objects.  On each pass of this function,
     *                      if this array contains a blob it is converted
     *                      to an array buffer and stored in bufferArr before
     *                      recalling this function. This array must contain
     *                      javascript objects of the following format:
     *                      { name: <output file name>, blob: <blob object> }
     * 
     * @param bufferArr     An array of arraybuffer objects to be added to the 
     *                      final zip file.  This array must contain javascript
     *                      objects of the following format:
     *                      { name: <output file name>, buffer: <buffer object> }
     * 
     * @param zipFileName   The name of the final zip file. 
     */
    var _downloadZipFile = function(blobArr, bufferArr, zipFileName) {

        if(blobArr.length === 0) {         
            
            // make zip file and download
            var zip = new JSZip();
            
            bufferArr.forEach(function(obj) {
                zip.file(obj.name, obj.buffer);
            });
            _downloadFile(zip.generate({type: "blob"}), zipFileName);
            
            return;
        }
        
        // convert blob to array buffer, then recursively call this function
        var fileReader = new FileReader();
        
        fileReader.onload = function() {
            
            var arrBuffer = this.result;
            bufferArr.push({ name: blobArr[0].name, buffer: arrBuffer });
            blobArr.splice(0, 1);
            
            //call this function
            _downloadZipFile(blobArr, bufferArr, zipFileName);
        };
        fileReader.readAsArrayBuffer(blobArr[0].blob);
    };

    /**
     * Creates the database (.dbf) file
     *
     * @param dbAttributes  an array of db attributes
     * @param dbBaseFields  the database table fields 
     * @param dbBaseValues  the database attribute values for each object  
     */
    my.createDbFile = function(dbSchema, dbRecords) {

        // check if the dbSchema parameter is an array
        if(Object.prototype.toString.call( dbSchema ) != '[object Array]') {
            dbSchema = [dbSchema];
        }

        // check if dbRecords is an array
        if(Object.prototype.toString.call( dbRecords ) != '[object Array]') {
            dbRecords = [dbRecords];
        }

        // create database file
        var dbHeader = _createDbfFileHeader(dbSchema, dbRecords.length);
        var dbContent = _createDbfFileContent(dbRecords, dbSchema, dbHeader.bytesPerRecord);

        _dbFile = _createFile(dbHeader.fileHeader, [dbContent]); 
    };
    
    my.createPolygonShapeFiles = function(polygons) {

        var mainRecords = [];
        var mainFileLength = 0;
        var recordNumber = 1;

        var indexRecords = [];
        var indexFileLength = 0;
        var indexRecordOffset = 50; 

        polygons.forEach(function(coordinates) {

            var buffers = _createPolygonBuffers(
                        recordNumber, 
                        coordinates,
                        indexRecordOffset);

            mainRecord = buffers.mainBuffer;
            indexRecord = buffers.indexBuffer;

            // add file content to file arrays
            mainRecords.push(mainRecord);
            indexRecords.push(indexRecord);

            // increment size of main file
            mainFileLength = mainFileLength + mainRecord.byteLength / 2;

            var mainView = new DataView(mainRecord);

            // set offset of next record in index file.
            indexRecordOffset = mainFileLength + 50;

            // increment size of index file
            indexFileLength += indexRecord.byteLength / 2;
            recordNumber++;
        });

        //bounding box for main and index file headers
        var fileHeaderBounds = _createFileHeaderBoundingBox(mainRecords);

        // create files           
        var fileHeader = _createFileHeader(mainFileLength, my.EShapeType.POLYGON, fileHeaderBounds);        
        var indexHeader = _createFileHeader(indexFileLength, my.EShapeType.POLYGON, fileHeaderBounds);
        _mainFile = _createFile(fileHeader, mainRecords);
        _indexFile = _createFile(indexHeader, indexRecords);  
    };

    /**
     * createPolygonBuffer(recordNumber, coordinates, indexOffset, 
     *          mainRecordsLength, indexRecordsLength) {
     *
     *     return { indexBuffer, mainBuffer }
     * }
     */
    var _createPolygonBuffers = function(recordNumber, coordinates, indexOffset) {

        // parse parts from polygon (parts define the start index of a new polygon ring)
        var parts = _parseParts(my.EShapeType.POLYGON, coordinates);
        var numParts = parts.length;

        // put coords into an array
        var points = _parseCoordinates(my.EShapeType.POLYGON, coordinates);

         // create bounding box for polygon
        var boundingBox = _createRecordBoundingBox(my.EShapeType.POLYGON, coordinates);

        var numPoints = points.length;      

        // create record content
        var recordContent = _createPolygonRecord(
            boundingBox,
            numParts,
            numPoints,
            parts,
            points);

        // create record header
        var contentLength = recordContent.byteLength / 2;
        recordHeader = _createRecordHeader(recordNumber, contentLength);

        var finalRecord = _mergeRecordToHeader(recordHeader, recordContent);

        // create index record
        var indexRecord = _createIndexRecord(indexOffset, contentLength);

        return { mainBuffer: finalRecord, indexBuffer: indexRecord};
    };

    /**
     * Creates and returns a file with the fileHeader and record parameters
     * 
     * @param fileHeader
     * @param records     The records that make up a file's contents
     *                    (RECORDS MUST BE GIVEN IN AN ARRAY!!!)
     */
    var _createFile = function(fileHeader, records) {

        if(!fileHeader) { throw "file header must be specified"; }    
        if(!records || records.length === 0) { throw "records must be specified"; }

        var contents = [fileHeader];

        for(var i = 0; i < records.length; i++) {

            contents.push(records[i]);           
        }
        //return contents;
        var blob = new Blob(contents, {type: "octet/stream"});

        return blob;
    };

    var _downloadFile = function(fileContents, fileName) {

        // create element
        var a = document.createElement("a");
        a.download = fileName;
        a.href = window.URL.createObjectURL(fileContents);
        var url = a.href;
        a.style = "display: none";

        // click element
        document.body.appendChild(a);  
        a.click();  
        document.body.removeChild(a);
    };

    /**
     * Creates a file header for a dbf file
     * 
     * @param tableSchema     an array which defines the schema of the table
     *                        this array should contain objects with the following format:
     *                        {
     *                              name: <name of field>, 
     *                              dataType: <type of data>,               // 1 character, see EDBAttributeTypes
     *                              length: <length of field>,              // number of bytes per record field
     *                              decimalCount: <position of decimal>     // number of integers after the decimal, only required if data type is numeric
     *                        }
     * @param numRecords      total number of records in the table
     * 
     * @return {
     *      fileHeader: <file header array buffer>,
     *       bytesPerRecord: <number of bytes for each record>
     */
    var _createDbfFileHeader = function(dbSchema, numRecords) {

        var bufferLength = 32 + (dbSchema.length * 32) + 1;

        var buffer = new ArrayBuffer(bufferLength);
        var bufferWriter = new DataView(buffer);   

        var time = new Date();
        var year = time.getFullYear().toString().substring(2);
        var month = time.getMonth() + 1;
        var day = time.getDate();

        //14 is unsigned and little endian
        bufferWriter.setInt8(0, 3);                     // version number (confirm this is correct)
        bufferWriter.setUint8(1, year, true);           // year
        bufferWriter.setUint8(2, month, true);          // month
        bufferWriter.setUint8(3, day, true);            // day
        bufferWriter.setUint32(4, numRecords, true);    // number of records
        bufferWriter.setUint16(8, bufferLength, true);  // bytes in header

        var numBytesRecord = 1; // number of bytes in each record + 1 for deletion flag.

        // add field descriptors
        var fieldIndx = 32;

        dbSchema.forEach(function(field) {

            //field descriptor index = 0;
            var fieldName = field.name;
            var dataType = field.dataType;

            if(fieldName.length > 9) {
                fieldName = fieldName.substring(0, 9);
            }

            // write field name in ascii 
            for(var i = 0; i < fieldName.length; i++) {

               bufferWriter.setInt8(fieldIndx + i, fieldName.charCodeAt(i));
            }
            fieldIndx += 11;

            // write field type in ascii
            bufferWriter.setInt8(fieldIndx, dataType.charCodeAt(0));        
            fieldIndx += 5;

            // write field length
            var fieldLength = _getFieldLength(field);

            bufferWriter.setUint8(fieldIndx, fieldLength);

            numBytesRecord += fieldLength; // increment bytes per record.
            fieldIndx++;

            // field decimal count
            if(dataType === my.EDBAttributeTypes.NUMBER) {

                if(field.decimalCount && field.decimalCount <=fieldLength) {

                    bufferWriter.setUint8(fieldIndx, field.decimalCount);
                }
                else {

                    bufferWriter.setInt8(fieldIndx, 0);
                }
            }
            fieldIndx += 15;
        });
        bufferWriter.setUint16(10, numBytesRecord, true); //  number of bytes per record        
        bufferWriter.setInt8(buffer.byteLength - 1, 0x0D);   // file header terminator 
        return {
            fileHeader: buffer,
            bytesPerRecord: numBytesRecord
        };
    };

    /**
     * Creates dbf file records
     * 
     * @param tableSchema           an array that defines the schema of a table
     *                              (refer to  createDbfFileHeader for to view structure)
     * @param tableData             an array of arrays to be saved as database content
     *                              
     *                              each inner array should contain objects of the following format:
     *                              {                                     
     *                                  field: <name of the table field>,
     *                                  value: <value to enter>
     *                              }
     * @param bytesPerRecord        the number of bytes required for each record
     * NOTE: it seems that blank spaces get filled with 0x20
     *       it is possible that numbers are right padded, and chars left padded
     */
    var _createDbfFileContent = function(dbRecords, dbSchema, bytesPerRecord) {

        var bufferLength = dbRecords.length * (bytesPerRecord + 1);
        var buffer = new ArrayBuffer(bufferLength);   
        bufferWriter = new DataView(buffer);    
        bufferWriter.setInt8(bufferLength - 1, 0x1A); // end of file marker

        var bufferIndx = 0;

        dbRecords.forEach(function(row) {

            bufferWriter.setInt8(bufferIndx, 0x20); // delete flag (0x20 indicates not deleted)
            bufferIndx++;

            // iterate through each table field, adding the appropriate fields from 
            // the tableRow
            dbSchema.forEach(function(field) {

                if(row.hasOwnProperty(field.name)) {

                    var fieldLength = _getFieldLength(field);
                    var rowField = row[field.name]; 
                    var i;
                    // write field data to buffer
                    switch (field.dataType) {

                        case my.EDBAttributeTypes.CHAR:

                            var str = rowField.toString();

                            for(i = 0; i < fieldLength; i++) {

                                if(i < str.length) {
                                    bufferWriter.setInt8(bufferIndx + i, str.charCodeAt(i));
                                }                                
                                else {
                                    bufferWriter.setInt8(bufferIndx + i, 0x20);
                                }                                
                            }
                            break;

                        case my.EDBAttributeTypes.DATE:  
 
                            var dateStr = rowField.toString();

                            for(i = 0; i < fieldLength; i++) {

                                var dateChr = (i >= dateStr.length)? ' ' : dateStr[i];                            
                                bufferWriter.setInt8(bufferIndx + i, dateChr.charCodeAt(-0));
                            }
                            break;

                        case my.EDBAttributeTypes.NUMBER:

                            var numStr = rowField.toString();

                            for(i = 0; i < fieldLength; i++) {

                                // number gets padded right
                                if(fieldLength - i <= numStr.length) {                                    
                                    var c = (fieldLength - i - numStr.length) * -1;                                                      
                                    bufferWriter.setInt8(bufferIndx + i, numStr.charCodeAt(c));
                                }                                
                                else {
                                    bufferWriter.setInt8(bufferIndx + i, 0x20);
                                }
                            }                            
                            break;

                        case my.EDBAttributeTypes.LOGICAL:

                            if(rowField === "Y" || rowField === "y" ||
                                rowField === "T" || rowField === "t" ||
                                rowField === true) { 
                                bufferWriter.setInt8(bufferIndx, "T".charCodeAt(0));                               
                            }                            
                            else { 

                                bufferWriter.setInt8(bufferIndx, "F".charCodeAt(0));                             
                            }
                            break;

                        default:
                            break;
                    }
                    bufferIndx += fieldLength;
                }                
            });
        });
        return buffer;  
    };

    /**
     * Helper function to determin the length of a field
     * for the .dbf file header.
     */    
    var _getFieldLength = function(field) {

        var fieldLength = 0;

        switch (field.dataType) {

            case my.EDBAttributeTypes.CHAR:

                if(field.length && field.length < 254) {

                    fieldLength = field.length;
                }
                else {

                    fieldLength = 253;
                }                
                break;
                    
            case my.EDBAttributeTypes.DATE:
                    
                fieldLength = 8;
                break;

            case my.EDBAttributeTypes.NUMBER:

                if(field.length && field.length < 18) {

                    fieldLength = field.length;
                }
                else {

                    fieldLength = 17;
                }                
                break;

            case my.EDBAttributeTypes.LOGICAL:

                fieldLength = 1;
                break;
                    
            default:
                break;
        }
        return fieldLength;
    };
            
    /**
     * Determines the amount of parts in a coordinates array.
     * 
     * @param shapeType         the type of shape that is made up by the coordinates
     * @param coordinates       an array of coordinates that make up the shape
     *                          these coordinates must conform to the following structure:
     *                          
     *                          Polygon: 
     *                          [      
     *                            [ [longitude, latitude], [.. , .. ] [ .. , ... ] ], // first array defines the outer ring
     *                            [ [longitude, latitude], [.. , .. ] [ .. , ... ] ]  // n > 1 arrays define inner rings
     *                          ]                                                     // first and last coordinate array in a
     *                                                                                // polygon ring must match
     * 
     * @return an array that specifies the index of the first point of each part
     */
    var _parseParts = function(shapeType, coordinates) { 
        
        var parts = [0];  // index of first part is always 0
        
        if(coordinates.length > 1) {
        
            switch(shapeType) {
            
                case my.EShapeType.POLYGON:
                    
                    for(var i = 1; i < coordinates.length; i++) {
                    
                        parts.push(coordinates[i].length);
                    }                
                    break;
                    
                default:
                    break;
            }        
        }
        return parts;
    };
    
    /**
     * Converts a coordinate array into a format usable by the .shp file
     * 
     * @param shapeType         the type of shape that is made up by the coordinates
     * @param coordinates       an array of coordinates that make up the shape
     *                          these coordinates must conform to the following structure:
     *                          
     *                          Polygon: 
     *                          [      
     *                            [ [longitude, latitude], [.. , .. ] [ .. , ... ] ], // first array defines the outer ring
     *                            [ [longitude, latitude], [.. , .. ] [ .. , ... ] ]  // n > 1 arrays define inner rings
     *                          ]                                                     // first and last coordinate array in a
     *                                                                                // polygon ring must match
     */
    var _parseCoordinates = function(shapeType, coordinates) { 
        
        var points = [];
        
        switch(shapeType) {

            case my.EShapeType.POLYGON:
                
                // Push outer ring to points
                var outer = _arrangeRing(coordinates[0], true);
                
                outer.forEach(function(coord) {
                    points.push(coord);
                });
                
                if(coordinates.length > 1) {
                    
                    for(var i = 1; i < coordinates.length; i++) {                        
                        
                        var inner = _arrangeRing(coordinates[i], false);
                        
                        for(var j = 0; j < inner.length; j++) {
                        
                            points.push(inner[j]);
                        }
                        /*
                        inner.forEach(function(coord) {
                            points.push(coord);
                        });
                        */
                    }
                }
                break;
            default:
                break;
        }    
        return points; 
    };
        
    /**
     * comparator function used to sort polygon coordinates in clockwise/counterclockwise
     * order.
     * function retrieved from http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
     */
    var _comparePoints = function(a, b) {

        var center = _centerOfPoly;
        
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
    var _arrangeRing = function(ring, isClockwise) {
                
        ring.splice(-1, 1);
        
        // calculate the center of all points 
        _centerOfPoly = [0, 0];           
        ring.forEach(function(coord) {
            
            _centerOfPoly[0] += coord[0];
           _centerOfPoly[1] += coord[1];
        });
        _centerOfPoly[0] = _centerOfPoly[0] / ring.length;
        _centerOfPoly[1] = _centerOfPoly[1] / ring.length;
            
        ring.sort(_comparePoints);
        ring.push(ring[0]);
        if(isClockwise === false) {
            ring.reverse();
        }
        return ring;
    };
    my.arrangeRing = _arrangeRing;
    /**
     * Calculates and returns a bounding box for a .shp or .shx? file header
     * 
     * @param records an array of merged records (record header and record content)
     */
    var _createFileHeaderBoundingBox = function(records) {

        if(!records || records.length < 1) { throw "records array is either empty or contains no contents"; }

        var recordReader = new DataView(records[0]);

        // each record is offset by 8 since a record contains a header
        var xMin = recordReader.getFloat64(12, true);
        var xMax = recordReader.getFloat64(28, true);    

        var yMin = recordReader.getFloat64(20, true);
        var yMax = recordReader.getFloat64(36, true);

    for(var i = 1; i < records.length; i++) {
    
            recordReader = new DataView(records[i]);

            // check if a new value can be added to the bounded box from the current record
            if(recordReader.getFloat64(12, true) < xMin) { xMin = recordReader.getFloat64(12, true); }
            else if(recordReader.getFloat64(28, true) > xMax) { xMax = recordReader.getFloat64(28, true); }

            if(recordReader.getFloat64(20, true) < yMin) { yMin = recordReader.getFloat64(20, true); }
            else if(recordReader.getFloat64(36, true) > yMax) { yMax = recordReader.getFloat64(36, true); }
        }    
        return new BoundingBox(xMin, xMax, yMin, yMax);
    };

    /**
     * Calculates a bounding box for a polygon record.
     * @param points The points that make up the polygon
     */
    var _createRecordBoundingBox = function(shapeType, coordinates) { //(points) {        

        if(!coordinates || coordinates[0].length < 2) { 
            
            throw "coordinates array is either malformed or undefined";
        }            
        
        var points = _parseCoordinates(shapeType, [coordinates[0]]);
        if(!points || points.length < 2) { throw "point array is either malformed or undefined"; }
                
        var xMin = points[0][0];
        var xMax = points[0][0];
        var yMin = points[0][1];
        var yMax = points[0][1];

        points.forEach(function(point) {

            if(point[0] < xMin) { xMin = point[0]; }
            else if(point[0] > xMax) { xMax = point[0]; }

            if(point[1] < yMin) { yMin = point[1]; }
            else if(point[1] > yMin) { yMax = point[1]; }
        });
        
        return new BoundingBox(xMin, xMax, yMin, yMax);    
    };
 
    /**
     * Creates and returns a file header for a .shx or .shp file
     * 
     * @param fileLength    the total length of the file in 16 bit words
     *                      e.g the header file is 100 bytes or 100 / 2 = 50 16 bit words.
     * @param shapeType     the type of shape contained in the file.  Can use EShapeType
     *                      to define the shape.
     * @param boundingBox   the minimum bounding rectangle needed to display all shapes
     *                      in the shapefile.
     */
    var _createFileHeader = function(fileLength, shapeType, boundingBox) {

        if(!fileLength) { throw "file length must be specified in file header"; }
        if(!shapeType) { throw "shape type must be specified in file header"; }
        if(!boundingBox) { throw "bounding box must be specified in file header"; }

        //add the length of the header to total file length.
        fileLength = fileLength + 50;
        
        var buffer = new ArrayBuffer(100);
        var bufferWriter = new DataView(buffer);

        bufferWriter.setInt32(0, 9994);                         // file code
        bufferWriter.setInt32(24, fileLength);                  // file length
        bufferWriter.setInt32(28, 1000, true);                  // version
        bufferWriter.setInt32(32, shapeType, true);             // shape type    
        bufferWriter.setFloat64(36, boundingBox.xMin, true);    // x min
        bufferWriter.setFloat64(44, boundingBox.yMin, true);    // y min
        bufferWriter.setFloat64(52, boundingBox.xMax, true);    // x max
        bufferWriter.setFloat64(60, boundingBox.yMax, true);    // y max
        bufferWriter.setFloat64(68, boundingBox.zMin, true);    // z min
        bufferWriter.setFloat64(76, boundingBox.zMax, true);    // z max
        bufferWriter.setFloat64(84, boundingBox.mMin, true);    // m min
        bufferWriter.setFloat64(92, boundingBox.mMax, true);    // m max

        return buffer;
    };
    
    /**
     * Creates and returns a record header for a .shp file
     *
     * @param recordNumber  the number of the record in the file 
     * @param contentLength the number of bytes in the record content (not
     *                      to be confused with total content length) in 16 
     *                      bit words e.g the header file is 8 bytes or 8 / 2 = 4 
     *                      16 bit words..
     */
    var _createRecordHeader = function(recordNumber, contentLength) {

        if(!recordNumber) { throw "record number must be specified in record header"; }
        if(!contentLength) { throw "content length must be specified in record header"; }

        var buffer = new ArrayBuffer(8);
        var bufferWriter = new DataView(buffer);

        bufferWriter.setInt32(0, recordNumber);     // record number
        bufferWriter.setInt32(4, contentLength);    // content length

        return buffer;
    };

    /**
     * Creates and returns a polygon record for a .shp file
     */
    var _createPolygonRecord = function(boundingBox, numParts, numPoints, parts, points) {

        if(!parts) { throw "parts must be specified to create a polygon record"; }
        if(!points) { throw "points must be specified to create a polygon record"; }
        if(!numPoints) { throw "number of points must be specified to create a polygon record"; }
        if(!boundingBox) { throw "bounding box must be specified to create a polygon record"; }
        
        var pointsStartPos = 44 + 4 * numParts; // the byte position that stores the points array
        var bufferLength = 16 * numPoints + pointsStartPos; // size of array buffer    
        var buffer = new ArrayBuffer(bufferLength);
        var bufferWriter = new DataView(buffer);

        bufferWriter.setInt32(0, my.EShapeType.POLYGON, true);     // polygon shape type
        bufferWriter.setFloat64(4, boundingBox.xMin, true);     // x min
        bufferWriter.setFloat64(12, boundingBox.yMin, true);    // y min
        bufferWriter.setFloat64(20, boundingBox.xMax, true);    // x max
        bufferWriter.setFloat64(28, boundingBox.yMax, true);    // y max
        bufferWriter.setInt32(36, numParts, true);              // number of parts
        bufferWriter.setInt32(40, numPoints, true);             // number of points

        // add each part
        var indx = 44;
        parts.forEach(function(value) {
            
            bufferWriter.setInt32(indx, value, true);
            indx += 4;
        });
        // add each point.  points should be structured as [ x, y ]    
        points.forEach(function(value) {
            
            bufferWriter.setFloat64(indx, value[0], true);
            indx += 8;
            
            bufferWriter.setFloat64(indx, value[1], true);
            indx += 8;
        });    
        return buffer;
    };

    /**
     * creates a index record for a .shx file
     * 
     * @param offset        offset of a record in the main file in 16 bit words
     *                      The offset for the filrst record in the main file is 50,
     *                      given the 100 byte header
     * @param contentLength the length of the content stored in the main file record
     *                      this should be the same value as the content length in 
     *                      the content record header
     */
    var _createIndexRecord = function(offset, contentLength) {

        if(!offset) { throw "an offset must be specifed in the index record"; }
        if(!contentLength) { throw "content length must be speicifed in the index record"; }
    
        var buffer = new ArrayBuffer(8);
        var bufferWriter = new DataView(buffer);

        bufferWriter.setInt32(0, offset);
        bufferWriter.setInt32(4, contentLength);
        
        return buffer;
    };

    /**
     * Merges a record header and record contents into a single array buffer
     * 
     * @param header  a record header array buffer
     * @param records a record content array buffers
     */
    var _mergeRecordToHeader = function(header, record) {

        if(!header) { throw "record header must be specified to merge with a record"; }
        if(!record) { throw "record content must be specified"; }

        var totalBytes = header.byteLength + record.byteLength;
        var buffer = new ArrayBuffer(totalBytes);
        var bufferWriter = new DataView(buffer);

        var headerReader = new DataView(header);
        var contentReader = new DataView(record);

        for(var i = 0; i < record.byteLength; i++) {

            // write record header
            if(i < header.byteLength) {
                bufferWriter.setInt8(i, headerReader.getInt8(i));
            }
            // write record content
            var contentIndx = i + header.byteLength;
            bufferWriter.setInt8(contentIndx, contentReader.getInt8(i));
        }
        return buffer;
    };
    return my;
}(ShapeFileMaker || {}));