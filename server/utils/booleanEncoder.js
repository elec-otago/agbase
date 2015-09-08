/**
 * Boolean Encoder
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
module.exports = {

    encode: function(object, properties, prefixes) {

        var encoded = "";

        if (object) {

            var boolToString = function (b) {
                return b ? '1' : '0';
            };

            for (var i = 0; i < properties.length; i++) {
                for (var x = 0; x < prefixes.length; x++) {
                    encoded += boolToString(object[prefixes[x] + properties[i]]);
                }
            }
        }

        return encoded;

    },
    decode: function(encoded, properties, prefixes) {
        var permissions = {};

        if (encoded) {
            var stringToBool = function (str) {
                return str === '1';
            };

            var options = {
                value: false,
                writable: true,
                enumerable: true,
                configurable: true
            };

            var encodedIndex = 0;
            for (var i = 0; i < properties.length; i++) {
                var propertyName = properties[i];
                for (var x = 0; x < prefixes.length; x++) {
                    options.value = stringToBool(encoded[encodedIndex++]);
                    Object.defineProperty(permissions, prefixes[x] + propertyName, options);
                }
            }
        }

        return permissions;
    }

};