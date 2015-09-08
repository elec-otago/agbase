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

        var FarmRole = agquire('ag/db/models/FarmRole');
        return migration.addColumn('FarmRole', 'inviteUsers', FarmRole.model.inviteUsers).catch(function() {
            // This is here because there's no way to check if a column
            // already exists in the table..
        });
    },

    down: function (migration, DataTypes) {

        return migration.removeColumn('FarmRole', 'inviteUsers');
    }
};