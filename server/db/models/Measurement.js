/**
 * Measurement Model
 * 
 * Copyright (c) 2015. Elec Research.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 * 
 * Author: Mark Butler, Tim Molteno.
 *
 *
 **/
var orm = require('../orm');
var Seq = orm.Seq;
var errors = require('../controllers/Errors');

module.exports = {
    model: {
        id: {type: Seq.BIGINT, primaryKey: true, autoIncrement: true},
        w05: Seq.REAL,
        w25: Seq.REAL,
        w50: Seq.REAL,
        w75: Seq.REAL,
        w95: Seq.REAL,
        timeStamp: {type: Seq.DATE, allowNull: false},
        comment: Seq.STRING,
        animalId: {
            type: Seq.BIGINT,
            allowNull: false,
            references: {model: "Animal", key: "id"},
            onDelete: "cascade"
        }, //defining foreign key here to get constraint
        algorithmId: {
            type: Seq.INTEGER,
            allowNull: false,
            references: {model: "Algorithm", key: "id"},
            onDelete: "cascade"
        } //defining foreign key here to get constraint
    },

    relations: {
        User: {type: 'belongsTo', opt: {as: 'user', onDelete: 'set null'}},
        Algorithm: {type: 'belongsTo', opt: {as: 'algorithm', onDelete: 'cascade'}},
        Animal: {type: 'belongsTo', opt: {as: 'animal', onDelete: 'cascade'}}
    },

    options: {
        freezeTableName: true,

        hooks: {
            beforeValidate: function (measurement) {
                var Promise = orm.sequelize.Promise;
                var error = null;
                if (measurement.timeStamp.toString() === 'Invalid Date') {
                   error = new errors.ValidationError('timeStamp invalid');
                }

                // 24 hour window
                var now = new Date().getTime() + (24 * 60 * 60 * 1000);
                if (measurement.timeStamp.getTime() > now) {
                    error = new errors.ValidationError('timeStamp is in the future');
                }

                if (error) {
                    return Promise.reject(error);
                } else {
                    return Promise.resolve();
                }
            }
        }
    }
};