/**
 * Created by mark on 19/03/15.
 */

var jsonIsOverSize = function(jsonObj, size){

    //simple check at the moment
    //look for arrays. make sure ther are no arrays bigger then size

    for(var name in jsonObj) {
        if (jsonObj.hasOwnProperty(name)){

            var childObj = jsonObj[name];

            if( Object.prototype.toString.call( childObj ) === '[object Array]' ) {

                if(childObj.length >= size){
                    return true;
                }
            }
        }
    }
    return false;
};

exports.addSupervisor = function (threshold) {

    if(! threshold){
        threshold = 1024;
    }

    console.log('set response size threshold to ' + threshold);

    return function (req, res, next){

        //console.log('supervising request');

        var theirJson = res.json.bind(res);

        req.on('close', function(){
            res.json = function(){};
        });

        res.json = function(body){

                //console.log('supervisor checking response..');

                if ( body && jsonIsOverSize(body, threshold)){

                    console.log("Response was greater than " + threshold);

                    return res.status(400).send( {'message': 'Generated response was too large - exceeded ' + threshold + ' results'});
                }

            return theirJson(body);
        };

        next();
    };
};
