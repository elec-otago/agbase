/**
 * AgBase: Toolbox Service
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: John Harbourne.
 *
 **/

appServices.factory('ToolboxService', function () {

    // use the built in join() and split() functions instead
    // takes a string of arrays and returns a comma separated string
    //var csStringMaker = function(stringarray){
    //    var rtnString = "";
    //    for(var i = 0; i < stringarray.length; i++)
    //    {
    //        rtnString += i > 0 ? ","+stringarray[i] : stringarray[i];
    //    }
    //
    //    return rtnString;
    //};
    
    return{
        csStringMaker: csStringMaker
    };
    
});