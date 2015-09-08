var orm = require('../orm');
var Seq = orm.Seq;

module.exports = {
	
	model:{
		id: { type: Seq.INTEGER, primaryKey: true, autoIncrement: true },
		name: {type: Seq.STRING, unique: 'uniqueInCategory', allowNull: false, validate: {
            notEmpty: {msg: "Empty algorithm"}
        }},
        measurementCategoryId: {
            type: Seq.INTEGER,
            unique: 'uniqueInCategory', // TODO: double check this unique
            references: {model: "MeasurementCategory", key: "id"},
            onDelete:"cascade",
            allowNull: false
        } //defining foreign key here to get constraint
	},

	relations:{
		Measurement: {type: 'hasMany', opt: {as: 'measurements', onDelete: 'cascade', foreignKey: 'algorithmId'}},
        MeasurementCategory: {type: 'belongsTo', opt: {as: 'measurementCategory', onDelete: 'cascade'}}
	},

	options:{
		freezeTableName: true
	}
};