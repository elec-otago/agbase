/**
 * Usage Tier Model
 *
 * Copyright (c) 2015. Elec Research.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/
 *
 * Author: Mark Butler
 *
 *
 **/
var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {
    model: {
        id: {type: Seq.BIGINT, primaryKey: true, autoIncrement: true},
        name: {type: Seq.STRING, allowNull: false, unique: true,
            validate: {
                notEmpty: {msg: "Empty name"}
            }
        },
        dailyRequests: {
            type: Seq.BIGINT,
            allowNull: false
        }
    },

    relations: {
        User: {type: 'hasMany', opt: {as: 'users', onDelete: 'cascade', foreignKey: 'usageTierId'}}
    },

    options: {
        freezeTableName: true
    }
};