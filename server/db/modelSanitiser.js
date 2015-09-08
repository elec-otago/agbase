var ModelTypes = require('./modelTypes');

var userSanitiser = function(user) {
    if (user.dataValues.hash) {
        delete user.dataValues.hash;
    }
};

// Runs on all models to remove common properties like creation/modification date
var allSanitiser = function(model) {
    if (model.dataValues.createdAt) {
        delete model.dataValues.createdAt;
    }
    if (model.dataValues.updatedAt) {
        delete model.dataValues.updatedAt;
    }
};

module.exports = {
    toJSON: function(model, type) {
        switch (type) {
            case ModelTypes.ALGORITHM_MODEL_TYPE:
                break;
            case ModelTypes.ANIMAL_MODEL_TYPE:
                break;
            case ModelTypes.FARM_MODEL_TYPE:
                break;
            case ModelTypes.FARMPERMISSION_MODEL_TYPE:
                break;
            case ModelTypes.FARMROLE_MODEL_TYPE:
                break;
            case ModelTypes.HERDMODEL_TYPE:
                break;
            case ModelTypes.MEASUREMENT_MODEL_TYPE:
                break;
            case ModelTypes.MEASUREMENTCATEGORY_MODEL_TYPE:
                break;
            case ModelTypes.USER_MODEL_TYPE:
                userSanitiser(model);
                break;
            default:
                // unknown model
                break;
        }
        allSanitiser(model);

        return model.dataValues;
    }
};