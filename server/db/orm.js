// https://github.com/JeyDotC/articles/blob/master/EXPRESS%20WITH%20SEQUELIZE.md

var filesystem = require('fs');
var ModelSanitiser = require('./modelSanitiser');
var ModelTypes = require('./modelTypes');
var forEach = require('./../utils/forEachIn');
var Sequelize = require('sequelize');
var Promise = require('../wowPromise');
var Transaction = require('./controllers/Transaction');
var modelsPath = "db/models"; //has to be relative to server root

var ourSequelize = null;
var models = {};
var relationships = {};

function init() {

    //synchronous read dir
    filesystem.readdirSync(modelsPath).forEach(function(name){
        var object = agquire("ag/db/models/" + name);
        var options = object.options || {};
        var modelName = name.replace(/\.js$/i, "");

        //console.log('modelName: '+ modelName);

        if (!options.instanceMethods) {
            options.instanceMethods = {};
        }

        options.instanceMethods.toJSON = function() {
            return ModelSanitiser.toJSON(this, ModelTypes[modelName.toUpperCase() + '_MODEL_TYPE']);
        };

        if (!options.classMethods) {
            options.classMethods = {};
        }

        options.classMethods.attributesExcluding = function(exclude) {
            var attributes = [];

            forEach(this.attributes, function(attribute) {
                //console.log(attribute);
                if (Array.isArray(exclude)) {
                    if (!exclude.contains(attribute.fieldName)) {
                        attributes.push(attribute.fieldName);
                    }
                } else if (exclude !== attribute.fieldName) {
                    attributes.push(attribute.fieldName);
                }
            });

            return attributes;
        };

        models[modelName] = ourSequelize.define(modelName, object.model, options);
        models[modelName].modelName = modelName;

        if("relations" in object){
            relationships[modelName] = object.relations;
        }
        models[modelName].includeForRelation = function(relation) {
            var association = this.associations[relation];
            if (association) {
                var target = association.target.name;
                return {model: self.model(target), as: relation};
            } else {
                return null;
            }
        };
    });

    for(var modelName in relationships){

        var modelRelationships = relationships[modelName];

        for(var relName in modelRelationships){

            var relation = modelRelationships[relName];

            var relType = relation.type;

            var relOpt = relation.opt || {};

            var optString = JSON.stringify(relOpt);

            //console.log(modelName + " " + relType + " " + relName);
            //console.log("props: ")
            //console.log(relOpt);

            var model = models[modelName];
            var relatedModel = models[relName];

            model[relType](relatedModel, relOpt);

            //console.log(modelName + "." + relType + "(" + relName + ")" + ", " + optString);
        }
    }

    return ourSequelize.sync();
}

var self = module.exports = {

    setup: function (database, username, password, obj){

        Transaction.setup(self, Sequelize);

        if(arguments.length === 2){
            ourSequelize = new Sequelize(database, username);
        }
        else if(arguments.length === 3){
            ourSequelize = new Sequelize(database, username, password);
        }
        else if(arguments.length === 4){
            ourSequelize = new Sequelize(database, username, password, obj);
        }

        self.sequelize = ourSequelize;

        return ourSequelize.authenticate().then(function() {
            console.log('Connection has been established successfully.');
        }).then(function(){

            return init();

        }).catch(function(err) {
            console.log("Unable to connect to the database: " + err);
            console.log(err.stack);
            return Promise.reject(new Error('Unable to connect to the database'));
        });
    },


    model: function (name){
        return models[name];
    },

    Seq: Sequelize,

    sequelize: ourSequelize,

    transaction: function(f) {
        return ourSequelize.transaction(f);
    }
};
