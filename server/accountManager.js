var dbDefaults = agquire('ag/db/dbDefaults');
var forEach = agquire ('ag/utils/forEachIn');



var usageCountMap = {}; //map for count on userId
var lastRequestMap = {}; //map for time of users last request. on userId

function getUsageLimit(user){

    var tiers = dbDefaults.usageTierMapByName;

    for(var key in tiers){
        if(tiers.hasOwnProperty(key)){
            var tier = tiers[key];

            if(tier.id === user.usageTierId){
                return tier.dailyRequests;
            }
        }
    }

    return dbDefaults.usageTier1.dailyRequests;
}

//usage count should refresh at midnight every night
exports.checkUsage = function(req,res,next){

    var userId = req.user.id;

    var lastRequestDay = lastRequestMap[userId];

    if(lastRequestDay) {
        lastRequestDay.setHours(0, 0, 0, 0); //round back to midnight
    }
    var todaysDay = new Date();
    todaysDay.setHours(0,0,0,0);
    var yesterday = new Date(todaysDay.getDate() - 1);

    //reset if the user hasn't queried In the last 24 hours
    var shouldResetCount = lastRequestDay && lastRequestDay <= yesterday;

    if(shouldResetCount || ! usageCountMap[userId]){
        usageCountMap[userId] = 1;

    }else{
        usageCountMap[userId]++;
    }

    var callCount = usageCountMap[userId];

    lastRequestMap[userId] = new Date();

    res.locals.apiCallCount = callCount;

    var usageLimit = getUsageLimit(req.user);

    if(callCount >= usageLimit) {
        return res.status(402).send( {message: "You have reached your daily usage limit of " + usageLimit + " requests!"});
    }

    next();
};


exports.usageAppender = function (req, res, next){

    var theirJson = res.json.bind(res);

    req.on('close', function(){
        res.json = function(){};
    });

    res.json = function(body){

        var userId = req.user.id;

        var callCount = usageCountMap[userId];

        body.apiCallCount = callCount;

        return theirJson(body);
    };

    next();
};