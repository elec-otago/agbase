var orm = require('../orm');
var Seq = orm.Seq;
var errors = require('../controllers/Errors');

var eidIsValid = function(eid){

    if(! eid) {
        return true; //no eid is ok
    }

    return typeof eid === "string";
};

module.exports = {
	
	model:{
		id: { type: Seq.BIGINT, primaryKey: true, autoIncrement: true },
		eid: {type: Seq.STRING, unique: true},
        vid: Seq.STRING, //can't have same vid in a farm??
        farmId: {
            type: Seq.INTEGER,
            allowNull: false,
            references: {model: "Farm", key: "id"},
            onDelete:"cascade"
        } //defining foreign key here to get constraint
	},

	relations:{
		Measurement: {type: 'hasMany', opt: {as: 'measurements', onDelete: 'cascade', foreignKey: 'animalId'}},
        Herd: {type: 'belongsTo', opt: {as: 'herd', onDelete: 'set null'}},
        Farm: {type: 'belongsTo', opt: {as: 'farm', onDelete: 'cascade'}}
	},

	options:{
		freezeTableName: true,
        hooks: {
            beforeValidate: function (animal) {
                var Promise = orm.sequelize.Promise;

                var error = null;
                if (!animal.eid && !animal.vid) {
                    error = new errors.ValidationError("Must provide eid or vid");
                } else if (eidIsValid() === false) {
                   error = new errors.ValidationError('invalid eid');
                } else if (animal.changed('herdId') && animal.herdId) {

                    // TODO I'm not sure that this is safe to do here. There is an issue
                    // TODO that results in a deadlock related to automatic transactions
                    // TODO in findOrCreate where the transaction is created and we need
                    // TODO to create a new entity. This validator then runs and if all connection
                    // TODO slots are occupied, getHerd() will never finish.
                    return animal.getHerd().then(function(herd) {
                        if (herd.farmId !== animal.farmId) {
                            throw new errors.ValidationError('animal and herd on different farms');
                        }
                    });
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