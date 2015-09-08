var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Promise = agquire('ag/wowPromise');

var readingSchema = new Schema({

    paddock_oid: {type: String, required: true},
    length: {type: Number, required: true},
    location: {type: [Number], required: true},
    altitude: {type: Number, default: 0},
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    algorithm_id: {type: Number, default: -1} //TODO add required at some point...
});
readingSchema.index({location: '2dsphere', sparse: true});

var Reading = mongoose.model('Reading', readingSchema);

Promise.promisifyAll(Reading);
Promise.promisifyAll(Reading.prototype);

module.exports = mongoose.model('Reading', readingSchema);