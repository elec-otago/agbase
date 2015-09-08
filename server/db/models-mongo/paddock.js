var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Promise = agquire('ag/wowPromise');

var paddockSchema = new Schema({
    id: Number,    
    farm_id: {type: Number, required: true},
    name: {type: String, required: true},
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    loc: {
        type: {type:String, default: "Polygon"},
        coordinates: {type: mongoose.Schema.Types.Mixed, required: true}
    }
});


var Paddock = mongoose.model('Paddock', paddockSchema);

Promise.promisifyAll(Paddock);
Promise.promisifyAll(Paddock.prototype);

module.exports = Paddock;