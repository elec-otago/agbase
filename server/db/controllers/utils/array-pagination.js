/**
 * array-pagination.js 
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Tim Miller.
 *
 **/

/**
 * Paginates and returns an array.
 * @param offset The position in the results array that the return
 *               items start from.
 * @param limit The maximum number of items to be returned.
 * @param results The array that contains the items to be paginated. 
 */
var paginate = function(offset, limit, results) {

    if(!Array.isArray(results)) {
        throw new Error("Results parameter must be an array");
    }
    
    if(offset) {
        offset = parseInt(offset);
            
        if(!isNaN(offset) && offset <= results.length) {
            results = results.slice(offset, results.length);
        }
        else if(offset > results.length) {
            // return nothing if given an offset greater 
            // than number of results returned by the query
            results = [];
        }
    }        
        
    if(limit) {
        limit = parseInt(limit);
            
        if(!isNaN(limit) && limit > 0){
            results = results.slice(0, limit);            
        }
    } 

    return results;  
}

module.exports = { paginate: paginate };
var mongoosePaginate = module.exports;