/**
* AgBase: Authentication Service
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
appServices.factory('UserPreferencesService', function(){

    var pref = {farm:null,herd:null,csAlgorithm:null,paddock:null,category:null};

    var setFarm = function(newFarm){
        pref.farm = newFarm;
        setHerd(null);
    };

    var setHerd = function(newHerd){
        if (!newHerd || pref.farm && pref.farm.id === newHerd.FarmId)
        {
            pref.herd = newHerd;
        }
    };
    
    var setPaddock = function(newPaddock){
        pref.paddock = newPaddock;
    };
    
    var setCategory = function(newCategory){
        pref.category = newCategory;
    };
        
    var setCsAlgorithm = function(newCsAlgorithm){
        pref.csAlgorithm = newCsAlgorithm;
    };

    var getFarm = function(){
        return pref.farm;
    };

    var getHerd = function(){
        return pref.herd;
    };

    var getCsAlgorithm = function(){
        return pref.csAlgorithm;
    };
    
    var getPaddock = function(){
        return pref.paddock;
    };

    var getCategory = function(){
        return pref.category;
    };


    /*
    * Returns the instance of the default value from the list.
    * if no default is found it will return the first item in the list. NB: default is not set to this value
     */
    var getDefaultInList = function(def, list){

        if(! list || list.length === 0){
            return null;
        }

        if(! def){
            return list[0];
        }

        for (var i = 0; i < list.length; i++){

            if(list[i].id === def.id){
                return list[i];
            }
        }

        return list[0];
    };

    var getCsAlgorithmFromList = function(list){
        return getDefaultInList(pref.csAlgorithm, list);
    };

    var getFarmFromList = function(list){
        return getDefaultInList(pref.farm,list);
    };

    var getHerdFromList = function(list){
        return getDefaultInList(pref.herd,list);
    };

    var getPaddockFromList = function(list){
        return getDefaultInList(pref.paddock,list);
    };
    
    var getCategoryFromList = function(list){
        return getDefaultInList(pref.category,list);
    };
    
    
    var getPrefs = function(){
        return pref;
    };

    return{
        getCsAlgorithmFromList: getCsAlgorithmFromList,
        getCsAlgorithm:getCsAlgorithm,
        getFarm:getFarm,
        getFarmFromList: getFarmFromList,
        getHerd:getHerd,
        getHerdFromList: getHerdFromList,
        getPaddock:getPaddock,
        getPaddockFromList:getPaddockFromList,
        getCategory:getCategory,
        getCategoryFromList:getCategoryFromList,
        getPrefs:getPrefs,
        setCsAlgorithm:setCsAlgorithm,
        setFarm:setFarm,
        setHerd:setHerd,
        setCategory:setCategory,
        setPaddock:setPaddock
    };
});