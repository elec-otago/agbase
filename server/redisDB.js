/*
 * Redis is used for storing JWT's that have been expired early by the system or user.
 */
var redis = require('redis');

var AWS = require('aws-sdk');

global.AWS_REGION = 'us-west-2';
global.CACHE_CLUSTER_ID = 'MoogleElastiCache';
global.CACHE_ENDPOINTS = [];
global.REDIS = null;



function createRedisClient(host){

    var redisClient = redis.createClient(6379, host);

    redisClient.on('error', function (err) {
        console.log('Error ' + err);
    });

    redisClient.on('connect', function () {
        console.log('Redis is ready');
    });

    return redisClient;
}


if(process.env.NODE_ENV === 'aws'){

    console.log("init redis for aws");

    return;

    AWS.config.update({region:global.AWS_REGION});

    var elasticache = new AWS.ElastiCache();

    function getElastiCacheEndpoints() {

        function sameEndpoints(list1, list2) {
            if (list1.length != list2.length)
                return false;
            return list1.every(
                function(e) {
                    return list2.indexOf(e) > -1;
                });
        }

        function logElastiCacheEndpoints() {
            global.CACHE_ENDPOINTS.forEach(
                function(e) {
                    console.log('redis Endpoint: '+e);
                });
        }

        elasticache.describeCacheClusters(
            {CacheClusterId:global.CACHE_CLUSTER_ID, ShowCacheNodeInfo:true},
            function(err, data) {
                if (!err) {
                    util.log('Describe Cache Cluster Id:'+global.CACHE_CLUSTER_ID);
                    if (data.CacheClusters[0].CacheClusterStatus === 'available') {
                        var endpoints = [];

                        data.CacheClusters[0].CacheNodes.forEach(
                            function(n) {
                                var e = n.Endpoint.Address+':'+n.Endpoint.Port;
                                var addr = n.Endpoint.Address;
                                console.log(addr);
                                endpoints.push(addr);
                            });
                        if (!sameEndpoints(endpoints, global.CACHE_ENDPOINTS)) {
                            console.log('REDIS Endpoints changed');
                            global.CACHE_ENDPOINTS = endpoints;
                            if (global.REDIS)
                                global.REDIS.quit();
                            global.REDIS = createRedisClient(endpoints[0]);
                            process.nextTick(logElastiCacheEndpoints);
                            setInterval(getElastiCacheEndpoints, 60000); // From now on, update every 60 seconds
                        }
                    } else {
                        setTimeout(getElastiCacheEndpoints, 10000); // Try again after 10 seconds until 'available'
                    }
                } else {
                    console.log('Error describing Cache Cluster:'+err);
                }
            });
    }
    getElastiCacheEndpoints();

}else{

    global.REDIS = createRedisClient("127.0.0.1");

}

exports.redis = redis;
exports.redisClient = global.REDIS;