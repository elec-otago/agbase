var orm = agquire('ag/db/orm');
var helpers = require('./utils/helpers');
var booleanEncoder = agquire('ag/utils/booleanEncoder');

var Promise = agquire('ag/wowPromise');
var forEach = agquire('ag/utils/forEachIn');

var getUserUsageTier = function(userId){

    var UsageTier = orm.model("UsageTier");
    return helpers.findOne(UsageTier, {where: {'users.id': userId}});
};

var createUsageTier = function(name, dailyRequests) {

    if(! name){
        return Promise.reject(new Error("No name provided for usage tier"));
    }

    if(! dailyRequests){
        return Promise.reject(new Error("No daily request max provided for usage tier"));
    }

    var newTier = {};
    newTier.name = name;
    newTier.dailyRequests = dailyRequests;

    var UsageTier = orm.model("UsageTier");
    return helpers.findOrCreateEntityOnly(UsageTier, {name: name}, newTier);
};


exports.createUsageTiers = function(tiers) {

    if(! tiers || ! tiers.length) {
        return Promise.reject(new Error("No roles provided"));
    }

    return Promise.promiseForArray(tiers, function(tier) {
        return createUsageTier(tier.name, tier.dailyRequests);
    });
};


exports.getUsageTiers = function(userId){

    if(userId) {
        return getUserUsageTier(userId);
    } else {
        var UsageTier = orm.model("UsageTier");
        return helpers.findAll(UsageTier, {});
    }
};


exports.getUsageTier = function(query) {

    var UsageTier = orm.model("UsageTier");

    return helpers.findOne(UsageTier, helpers.createParamsForIdIfRequired(query));
};

exports.getUsageTierByName = function(name){

    return exports.getUsageTier({where:{name: name}});
};
