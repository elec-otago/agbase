
// TODO refactor into helpers or vice versa
var responder = require('./responder');
var forEach = agquire('ag/utils/forEachIn');
var defined = agquire('ag/utils/defined');
var validator = require('validator');

var OPTIONAL_VALUE_NOT_PRESENT      = -1;

var isFunction = function(x) {
    return typeof x === 'function';
};

var hasValue = function(x) {
    return defined(x) && x !== null;
};

var optional = function(f) {

    var validator = function(x) {
        if (!defined(x) || x === null) {
            return OPTIONAL_VALUE_NOT_PRESENT;
        } else {
            return f(x);
        }
    };
    validator['__is_optional_check'] = true;
    return validator;
};

var arrayOfObjects = function(expected) {

    var validator = function() {};
    validator['__array_of_objects'] = expected;
    return validator;
};


function validateObject(expected, data, params) {

    var failed = null;
    var numberValid = 0;
    var requiredValid = 0;

    for (var key in expected) {
        if (!expected.hasOwnProperty(key)) {
            continue;
        }

        if (key == '__at_least') {
            requiredValid = expected[key];
            continue;
        }

        var valid = false;
        var input = data[key];
        var validator = expected[key];

        if (isFunction(validator)) {
            if (validator.hasOwnProperty('__is_optional_check')) {
                valid = validator(input);
                if (valid === OPTIONAL_VALUE_NOT_PRESENT) {
                    valid = true;
                    numberValid--;
                }
            } else if (hasValue(input)) {
                if (validator.hasOwnProperty('__array_of_objects')) {

                    params[key] = [];

                    forEach(input, function(obj) {
                        var parsed = {};
                        valid = validateObject(validator.__array_of_objects, obj, parsed);
                        if (valid !== true) {
                            failed = key + '.' + valid;
                            return false;
                        } else {
                            params[key].push(parsed);
                        }
                    });


                } else if (hasValue(input)) {
                    valid = validator(input);
                }
            }
        } else {

            if (!hasValue(input)) {
                if (validator.optional === true) {
                    continue;
                } else {
                    valid = false;
                }
            } else {
                params[key] = {};
                valid = validateObject(validator, input, params[key]);
                if (valid !== true) {
                    failed = key + '.' + valid;
                    break;
                }
            }
        }

        if (valid === true) {
            params[key] = input;
            numberValid++;
        } else {
            failed = key;
            break;
        }

    }

    if (failed === null && numberValid < requiredValid) {
        failed = 'requires_' + requiredValid + '_or_more_values';
    }

    return failed === null ? true : failed;
}

var validate = function(input, res, expected, success) {

    var params = {};

    var result = validateObject(expected, input, params);
    if (result !== true) {
        responder.rejectWithUserError(res, responder.errors.missing_field, result);
    } else {
        success(params);
    }
};

var nonEmptyString = function(str) {
    return str !== null && (typeof str === 'string' || str instanceof String) && str.length > 0;
};

var arrayOf = function(f) {

    return function(array) {
        if (!Array.isArray(array)) {
            return false;
        }

        var valid = true;
        array.forEach(function(x) {
            valid = valid && f(x);
        });
        return valid;
    };

};

module.exports = {

    validator: validator,
    validate: validate,
    optional: optional,
    notEmptyString: nonEmptyString,
    arrayOf: arrayOf,
    arrayOfObjects: arrayOfObjects,

    isValidBundle: function(x) {
        return nonEmptyString(x) &&  /(?:\$[0-9]+\$[A-Za-z0-9-_]+)+$/.test(x);
    },
    isValidUrlDescriptor: function(obj) {
        return validator.isURL(obj.base) && nonEmptyString(obj.param);
    }

};