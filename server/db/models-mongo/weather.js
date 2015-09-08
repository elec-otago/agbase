var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var weatherSchema = new Schema({

    farm_id: Number,

    temperature: Number, 
    humidity: Number,
    wind_direction: Number,
    wind_speed: Number,
    rain_1_hr: Number,
    rain_24_hr: Number,
    rain_1_min: Number,
    atmospheric_pressure: Number,

    location: {
        type: [Number],
        index: { type: '2dsphere', sparse: true },
        required: true
    },
    altitude: Number,
    created: Date,
    algorithm_id: Number
});
module.exports = mongoose.model('Weather', weatherSchema);