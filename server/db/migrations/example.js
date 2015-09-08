/**
 * Example database migration
 *
 * For more info see https://github.com/sequelize/umzug
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
'use strict';

module.exports = {
    up: function(migration, DataTypes) {

        return migration.createTable('Sessions', {

            sid: {
                type: DataTypes.STRING,
                allowNull: false
            },

            data: {
                type: DataTypes.STRING,
                allowNull: false
            },

            createdAt: {
                type: DataTypes.DATE
            },

            updatedAt: {
                type: DataTypes.DATE
            }

        }).then(function() {
            return migration.addIndex('Sessions', ['sid']);

        });
    },

    down: function (migration, DataTypes) {

        return migration.dropTable('Sessions');
    }
};