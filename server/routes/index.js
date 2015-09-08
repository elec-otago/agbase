var express = require('express');
var router = express.Router();
var path = require('path');


var landingDir = __dirname + "/../public/landing/";
var webAppDir = __dirname + "/../public/ng/";
var docsDir = __dirname + "/../public/docs/";

/* GET landing page. */
router.get('/', function(req, res) {
    res.sendfile('index.html', {root: landingDir});
});

router.use(express.static(path.resolve(landingDir)));

if(process.env.NODE_ENV !== 'aws') {

    //TODO: clean up these routes
    router.use('/ng/assets', express.static(path.join(webAppDir, '/assets')));
    router.use('/ng/src', express.static(path.join(webAppDir, '/src')));
    router.use('/ng/vendor', express.static(path.join(webAppDir, '/vendor')));
    router.use('/ng', express.static(path.join(webAppDir, '/')));

    router.all('/ng/*', function (req, res, next) {

        res.sendFile('index.html', {root: path.join(webAppDir, '/')});

    });

    router.use('/doc/api/', express.static(path.join(docsDir, '/apidoc')));
    router.use('/doc/ng/', express.static(path.join(docsDir, '/ngdoc')));
}

module.exports = router;
