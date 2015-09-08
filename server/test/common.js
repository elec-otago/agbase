chai = require("chai");
chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

should = chai.should();

chai.use(require('chai-things'));

forEach = require('../utils/forEachIn');

Promise = require('../wowPromise');

global.agquire = function(name) {

    var prefix = "ag/";

    if(name.indexOf(prefix) === 0){
        name = name.substring(prefix.length, name.length);
        return require(__dirname + '/../' + name);

    } else {
        return require(name);
    }
};