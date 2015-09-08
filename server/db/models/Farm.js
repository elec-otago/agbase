var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {
	
	model:{
		id: { type: Seq.INTEGER, primaryKey: true, autoIncrement: true },
		name: {type: Seq.STRING, unique: true, allowNull: false, validate: {
            notEmpty: "Empty name"
        }}
	},

	relations:{
		Animal: {type: 'hasMany', opt: {as: 'animals', onDelete: 'cascade', foreignKey: 'farmId'}},
        Herd: {type: 'hasMany', opt: {as: 'herds', onDelete: 'cascade', foreignKey: 'farmId'}},
        FarmPermission: {type: 'hasMany', opt: {as: 'permissions', onDelete: 'cascade', foreignKey: 'farmId'}}
    },

    options:{
        freezeTableName: true
    }
};