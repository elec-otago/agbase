/**
 * Basic, Safe array iteration
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


module.exports = function(array, func) {

    for(var key in array){
        if(array.hasOwnProperty(key)){
            var result = func(array[key]);
            if (result === false) {
                break;
            }
        }
    }
};