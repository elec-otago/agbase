// Sequelize uses bluebird promises
var Promise = require('sequelize/lib/promise');
var forEach = require('./utils/forEachIn');

module.exports = Promise;
module.exports.promiseForArray = function(array, factory) {

    var promises = [];
    var index = 0;
    forEach(array, function(x) {
        var promise = factory(x, index++);
        if (promise) {
            promises.push(promise);
        }
    });

    return Promise.all(promises);
};