/**
 * Server Main File
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler.
 *
 **/
global.agquire = function(name) {

    var prefix = "ag/";

    if(name.indexOf(prefix) === 0){
        name = name.substring(prefix.length, name.length);
        return require(__dirname + '/' + name);

    } else {
        return require(name);
    }
};

var express = agquire('express');
var path = agquire('path');

var logger = agquire('morgan');
var cookieParser = agquire('cookie-parser');
var bodyParser = agquire('body-parser');


var webUI = agquire('ag/routes/index');
var api = agquire('ag/routes/api');
var favicon;
var app = express();

var compression = agquire('compression');

app.set('model', agquire('ag/db/orm'));

var wowDB = agquire('ag/db/db');
var mongoDB = agquire('ag/db/mongoDB');

//redirect insecure connections
//
//app.use(function(req, res, next) {
//
//    if(!req.secure) {
//        return res.redirect(['https://', req.get('Host'), req.url].join(''));
//    }
//    next();
//});

app.use(compression());

if(process.env.NODE_ENV !== 'aws') {
    favicon = require('serve-favicon');
    app.use(favicon(__dirname + '/public/ng/assets/icon/favicon.ico'));
}

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true ,limit:'50mb'}));
app.use(cookieParser());
app.use('/', webUI); //serves up all the UI

app.use('/api', api); //hosts the rest api


/**
 * Catch unknown routes and return something generic. 
 * 
 * Remember. Unknown routes are NOT errors in Express
 * see http://expressjs.com/starter/faq.html
 * 
 * http://webapplog.com/error-handling-and-running-an-express-js-app/
 * */
function unknownRouteHandler(req, res, next) {
  var err = new Error("No such route");
  res.status(404).json({error:err.message});
}

/**
 * Error Handler that returns a stack trace in the 
 * response body. This is used in the development
 * environment.
 * 
 * */
function stackTraceErrorHandler(err, req, res, next) {
    res.status(err.status || 500);
    console.error(err.stack);
    res.send({
        message: err.message,
        status: res.status,
        error: err.stack
    });
}

/**
 * Error Handler that returns a message without a 
 * stack trace.
 * 
 * */
function productionErrorHandler(err, req, res, next) {
    res.status(err.status || 500);
    console.error(err.stack);
    res.send({
        message: err.message,
        status: res.status,
        error: {}
    });
}

app.use(unknownRouteHandler);

agquire('ag/utils/mailer/mailer').loadTemplates();


if (process.env.NODE_ENV === 'aws') {
    app.use(productionErrorHandler);
}else{
  app.use(stackTraceErrorHandler);
}

wowDB.setup().then(function(){

    console.log("DB Setup complete");
});


mongoDB.setup(function(){
    console.log("Spatial DB Setup complete");
});

module.exports = app;
