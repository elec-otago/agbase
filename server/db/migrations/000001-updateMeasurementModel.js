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

         return migration.sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='Measurement' and column_name='value1'").spread(function(columns){

             if(columns.length === 0){
                 return;
             }

             var msg = "\n" +
                 "\n#######################################\n\n" +
                 "This Migration will rename the measurement table columns from\n" +
                 "value1 etc to w05" +
                 "\n#######################################\n";

             console.log(msg);

             return migration.renameColumn(
                 'Measurement',
                 'value1',
                 'w05',
                 DataTypes.DECIMAL
             ).then(function(){

                     return migration.renameColumn(
                         'Measurement',
                         'value2',
                         'w25',
                         DataTypes.DECIMAL
                     );

                 }).then(function(){

                     return  migration.renameColumn(
                         'Measurement',
                         'value3',
                         'w50',
                         DataTypes.DECIMAL
                     );

                 }).then(function(){

                     return  migration.renameColumn(
                         'Measurement',
                         'value4',
                         'w75',
                         DataTypes.DECIMAL
                     );

                 }).then(function(){

                     return  migration.renameColumn(
                         'Measurement',
                         'value5',
                         'w95',
                         DataTypes.DECIMAL
                     );

                 });
         });
     },

     down: function (migration, DataTypes) {


         return migration.renameColumn(
             'Measurement',
             'w05',
             'value1',
             DataTypes.DECIMAL
         ).then(function(){

                 return migration.renameColumn(
                     'Measurement',
                     'w25',
                     'value2',
                     DataTypes.DECIMAL
                 );

             }).then(function(){

                 return  migration.renameColumn(
                     'Measurement',
                     'w50',
                     'value3',
                     DataTypes.DECIMAL
                 );

             }).then(function(){

                 return  migration.renameColumn(
                     'Measurement',
                     'w75',
                     'value4',
                     DataTypes.DECIMAL
                 );

             }).then(function(){

                 return  migration.renameColumn(
                     'Measurement',
                     'w95',
                     'value5',
                     DataTypes.DECIMAL
                 );

             });
     }
 };