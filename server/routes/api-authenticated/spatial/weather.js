/**
 * API for spatial readings
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller.
 *
 **/
var express = require('express');

var WeatherController = agquire('ag/db/controllers/WeatherController');

var router = express.Router();

/**
 * @api {post} /spatial/weather/ Create a Weather Measurement
 * @apiName PostWeatherMeasurements
 * @apiGroup Weather Measurements
 *
 * @apiParam {Number} farm_id id of the farm from which the weather measurement was taken.
 * @apiParam {Number[]} location The location from which the weather measurement was taken.  The position's longitude must be the first entry.
 * @apiParam {Number} [altitude] The altitude from which the weather measurement was taken.
 * @apiParam {Date} [created] The date that the weather measurement was taken.
 * @apiParam {Number} [temperature] The temperature measured in degrees celcius at the time of the weather measurement.
 * @apiParam {Number} [humidity] The humidity at the time of the weather measurement.
 * @apiParam {Number} [wind_direction] The direction of the wind TODO: determine how to keep this.
 * @apiParam {Number} [wind_speed] The wind speed measured in kilometers per hour at the time of the weather measurement.
 * @apiParam {Number} [rain_1_hr] Total rainfall measured in centermeters over the last hour.
 * @apiParam {Number} [rain_24_hr] Total rainfall measured in centermeters over the last day.
 * @apiParam {Number} [rain_1_min] Total rainfall measured in centermeters over the last minute.
 * @apiParam {Number} [atmospheric_pressure] Atmospheric pressure at the time of the weather measurement.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "farm_id": 1,
 *          "location": [100, 1],
 *          "created": "2015-01-13",
 *          "altitude": 2,
 *          "temperature": 15,
 *          "humidity": 40,
 *          "wind_direction": ,
 *          "wind_speed": 1.6,
 *          "rain_1_hr": 0,
 *          "rain_24_hr": 1.5,
 *          "rain_1_min": 0,
 *          "atmospheric_pressure": 1015.8 
 *      }
 *
 * @apiParamExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Weather Data Saved",
 *          "data":
 *          {
 *              "_id": "ff87654321",
 *              "farm_id": 1,
 *              "location": [100, 1],
 *              "created": "2015-01-13",
 *              "altitude": 2,
 *              "temperature": 15,
 *              "humidity": 40,
 *              "wind_direction": ,
 *              "wind_speed": 1.6,
 *              "rain_1_hr": 0,
 *              "rain_24_hr": 1.5,
 *              "rain_1_min": 0,
 *              "atmospheric_pressure": 1015.8 
 *          }
 *      }
 */
router.post('/', function(req, res) {

    var weatherDetails = req.body;
    
    WeatherController.createReading(weatherDetails, function(err, reading) {
        
        if(!!err) {
            console.log(err);
            return res.status(422).send({error: err.message});
        }              
        return res.json({message: "Weather Data Saved", data: reading});
        
    });
});

/**
 * @api {put} /spatial/weather/:object_id Update a Weather Measurement
 * @apiName PutWeatherMeasurments
 * @apiGroup Weather Measurements
 *
 * @apiParam {String} object_id Id of weather measurement to update.  See Create a Weather Measurement for a list of fields.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "farm_id": 1,
 *          "location": [100, 1],
 *          "created": "2015-01-13",
 *          "altitude": 2,
 *          "temperature": 15,
 *          "humidity": 40,
 *          "wind_direction": ,
 *          "wind_speed": 1.6,
 *          "rain_1_hr": 0,
 *          "rain_24_hr": 1.5,
 *          "rain_1_min": 0,
 *          "atmospheric_pressure": 1015.8 
 *      }
 *
 * @apiParamExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "message": "Updated Weather Data",
 *          "data":
 *          {
 *              "farm_id": 1,
 *              "location": [100, 1],
 *              "created": "2015-01-13",
 *              "altitude": 2,
 *              "temperature": 15,
 *              "humidity": 40,
 *              "wind_direction": ,
 *              "wind_speed": 1.6,
 *              "rain_1_hr": 0,
 *              "rain_24_hr": 1.5,
 *              "rain_1_min": 0,
 *              "atmospheric_pressure": 1015.8 
 *          }
 *      }
 */
router.put('/:object_id', function(req, res) {

    var _id = req.params.object_id;
    var newDetails = req.body;

    WeatherController.updateReading(_id, newDetails, function(err, reading) {

        if(err) {
            res.status(422).send({error: err.message});
        }
        else {
            res.send({message: "Updated Weather Data", data: reading});
        }
    });
});
/**
 * @api {delete} /spatial/weather/:object_id Delete a Weather Reading
 * @apiName DeleteWeatherMeasurement
 * @apiGroup Weather Measurements
 *
 * @apiParam {String} object_id Id of weather measurement to delete.
 *
 * @apiSuccessExample Success-Response
 *  HTTP/1.1 200 OK
 *  {
 *      "message": "Deleted Weather Data"
 *  }
 */
router.delete('/:object_id', function(req, res) {

    var _id = req.params.object_id;

    WeatherController.deleteReading(_id, function(err) {

        if(err) {
            res.status(422).send({error: err.message});
        }
        else {
            res.send({message: "Deleted Weather Data"});
        }
    });
});

/**
 * @api {get} /spatial/weather/ Get Weather Measurements
 * @apiName GetWeatherMeasurements
 * @apiGroup Weather Measurements
 *
 * @apiParam {number} farms Id of farms that contain requested weather measurements.
 * @apiParam {String} [start_date] Get weather measurements that were taken after this date.
 * @apiParam {String} [end_date] Get weather measurements that were taken before this date.
 * @apiParam {Number} [limit] Maximum number of results that the query should return.  The AgBase API cannot return more than 1000 results.
 * @apiParam {Number} [offset] The offset from the start of the query result.
 *
 * @apiSuccessExample Success-Response
 *  {
 *      "data":
 *      [
 *          {
 *              "_id": "ff87654321",
 *              "farm_id": 1,
 *              "location": [100, 1],
 *              "created": "2015-01-13",
 *              "altitude": 2,
 *              "temperature": 15,
 *              "humidity": 40,
 *              "wind_direction": ,
 *              "wind_speed": 1.6,
 *              "rain_1_hr": 0,
 *              "rain_24_hr": 1.5,
 *              "rain_1_min": 0,
 *              "atmospheric_pressure": 1015.8 
 *          }
 *      ]
 *  }
 */
router.get('/', function(req, res) {

    var farms;
    var params = req.query;

    if(params.farm_id) {
        farms = params.farm_id.split(',');
    }

    WeatherController.getReadings(farms, params.start_date, params.end_date, params.limit, 
                                  params.offset, function(err, readings) {

        if(err) {
            res.status(422).send({error: err.message});
        }
        else {
            res.send({data: readings});
        }
    });
});
module.exports = router;