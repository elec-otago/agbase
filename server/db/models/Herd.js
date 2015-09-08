var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {

    model: {
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        name: {
            type: Seq.STRING,
            allowNull: false,
            unique: 'uniqueInFarm', //only for farm
            validate: {
                notEmpty: "Empty name"
            }
        },
        farmId: {
            type: Seq.INTEGER,
            unique: 'uniqueInFarm',
            allowNull: false,
            references: {model: "Farm", key: "id"},
            onDelete: "cascade"
        } //defining foreign key here to get constraint
    },

    relations: {
        Animal: {type: 'hasMany', opt: {as: 'animals', onDelete: 'SET NULL', foreignKey: 'herdId'}},
        Farm: {type: 'belongsTo', opt: {as: 'farm', onDelete: 'cascade'}}
    },

    options: {
        freezeTableName: true
    }


};