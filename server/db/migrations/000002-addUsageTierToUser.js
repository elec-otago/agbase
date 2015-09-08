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

         return migration.sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='User' and column_name='usageTierId'").spread(function(columns){

             if(columns.length > 0){
                 return;
             }

             var msg = "\n" +
                 "\n#######################################\n\n" +
                 "This Migration will add the usage tier foreign key to the user model\n" +
                 "\n#######################################\n";

             console.log(msg);

             return migration.addColumn(
                 'User',
                 'usageTierId',
                 {
                     type: DataTypes.INTEGER,
                     references: {model:"UsageTier", key: "id"},
                     onDelete: "cascade"
                 }
             );
         });
     },

     down: function (migration, DataTypes) {

         return migration.removeColumn(
             'User',
             'usageTierId'
         );
     }
 };