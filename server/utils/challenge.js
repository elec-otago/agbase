var uuid = require('node-uuid');

module.exports = {
    create: function() {
        // v4 is a random uuid, v1 is time based
        return uuid.v4();
    },

    buildUrl: function(urlDescriptor, bundle) {
        return urlDescriptor.base + '?' + urlDescriptor.param + '=' + bundle;
    }
};
