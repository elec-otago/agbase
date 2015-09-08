var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {
	
	model:{
		id: { type: Seq.INTEGER, primaryKey: true, autoIncrement: true },
		name: {type: Seq.STRING, unique: true, validate: {
            notEmpty: {msg: "Empty algorithm"}
        }},
        isSpatial: {type: Seq.BOOLEAN, defaultValue: false}
    },

	relations:{
		Algorithm: {type: 'hasMany', opt: {as: 'algorithms', onDelete: 'cascade', foreignKey: 'measurementCategoryId'}}
	},

    options:{
        freezeTableName: true
    }
};