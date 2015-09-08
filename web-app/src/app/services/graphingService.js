/**
 * AgBase: Graphing Service
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

appServices.factory('GraphingService', function () {
  var animal = null;
  
  return{
    getAnimalId: function()
    {
      return animal.id;
    },
    setAnimal: function(value)
    {     
      animal = value;
      console.log("Graphing service logging new animal ID: " + animal.id);
    },
    getAnimal: function()
    {
      return animal;
    }
  };
});