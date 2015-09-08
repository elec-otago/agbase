onmessage = function(e) {
    importScripts('spreader-map.js');

    var paddock = e.data.paddock;
    var polygon = e.data.polygon;
    var measurements = e.data.measurements;
    var resMeters = e.data.resMeters;
    
    var spreaderMap  = SpreaderMap.calculateSpreaderMap(paddock, polygon, measurements, resMeters);

    postMessage(spreaderMap);
    close();
};