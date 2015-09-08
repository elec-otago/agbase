var URLSafeBase64 = require('urlsafe-base64');
var defined = agquire('ag/utils/defined');
var forEach = agquire('ag/utils/forEachIn');

// We only decode known data
var CHALLENGE_TOKEN_ID               = 0;
var FARM_ID                          = 1;
var USER_ID                          = 2;
var FARM_INVITE_CHALLENGE            = 3;

var KNOWN_ITEMS = [
    CHALLENGE_TOKEN_ID,
    FARM_ID,
    USER_ID,
    FARM_INVITE_CHALLENGE
];

var encode = function(string) {
    return URLSafeBase64.encode(new Buffer(string));
};

var decode = function(string) {
    return URLSafeBase64.decode(new Buffer(string)).toString();
};

var Encoder = function(bundleId, data) {

    this.data = '';

    if (arguments.length === 2) {
        this.append(bundleId, data);
    }
};

Encoder.prototype.append = function(bundleId, data) {
    this.data += '$' + bundleId + '$' + encode(data.toString());
};

Encoder.prototype.getData = function() {
    return this.data;
};

var Decoder = function(bundle) {

    this.data = null;

    var components = bundle.split('$', 1 + (2 * KNOWN_ITEMS.length));
    // First component should be an empty string (we start with $)
    if (components.length === 0 || components[0] !== '') {
        return;
    }

    components.splice(0, 1);

    var parsedData = {};

    if (components.length % 2 == 0) {

        var failed = false;

        for (var x = 0; x < components.length / 2; x++) {
            var identifier = parseInt(components[2*x]);

            // Identifier must be a positive integer and must
            // be unique within the bundle.
            if (isNaN(identifier) ||
                identifier > KNOWN_ITEMS[KNOWN_ITEMS.length-1] ||
                identifier < 0 ||
                parsedData.hasOwnProperty(identifier))
            {
                failed = true;
                break;
            }

            var data = decode(components[2*x+1]);
            if (data.length === 0) {
                failed = true;
                break;
            }

            parsedData[identifier] = data;
        }

        if (failed) {
            parsedData = {};
        }
    }

    this.data = parsedData;
};

Decoder.prototype.dataForKey = function(key) {
    var data = this.data[key];
    return defined(data) ? data : null;
};

Decoder.prototype.containsAll = function(keys) {
    var valid = true;
    var self = this;

    forEach(keys, function(key) {
        valid = valid && self.dataForKey(key) !== null;
        return valid;
    });

    return valid;
};

module.exports = {
    CHALLENGE_TOKEN_ID: CHALLENGE_TOKEN_ID,
    FARM_ID: FARM_ID,
    USER_ID: USER_ID,
    FARM_INVITE_CHALLENGE: FARM_INVITE_CHALLENGE,

    Decoder: Decoder,
    Encoder: Encoder
};