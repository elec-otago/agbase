var defined = agquire('ag/utils/defined');
var forEach = agquire('ag/utils/forEachIn');
var responder = require('./responder');

module.exports = {
    /**
     * Parse the request query in a consistent manner. Allow users
     * to specify entities by either entity or entityId. The value
     * is stored in params.entityId. Likewise, parse includes and
     * create two lists: include (list of names that are included)
     * and params.includes which is a boolean map of requested includes.
     * include can just be passed as is to database code, and params.includes
     * is used for checking permissions.
     *
     * Format for options:
     *
     * {
     *      includes: ['animal', ...],
     *      entities: ['animal', 'farm', ...],
     *      other: ['name', 'offset', ...]
     * }
     *
     * Output:
     * {
     *      includeList: [ union of options.includes and the query string includes ],
     *      include: {'animal': true, 'farm': false, ...},
     *      params: {
     *          name: "cat",
     *          farmId: 4,
     *          ...
     *      }
     * }
     *
     * @param query res.query
     * @param options see above
     * @returns see above
     */
    parseQuery: function(query, options) {
        var result = {
            includeList: [],
            include: {},
            params: {}
        };

        var x = 0;
        if (defined(options.includes)) {

            // always want to set these values
            for (x = 0; x < options.includes.length; x++) {
                result.include[options.includes[x]] = false;
            }

            if (defined(query.include)) {
                var userIncludes = query.include.split(',');

                // Build include maps
                for (x = 0; x < options.includes.length; x++) {

                    var include = options.includes[x];
                    var outputKey = null;
                    var hasInclude = false;

                    // Loop through user optional array and check user includes
                    if (typeof include === 'string' || include instanceof String) {
                        outputKey = include;
                        hasInclude = userIncludes.indexOf(outputKey) > -1;
                    } else {
                        // Assume that it's a map from: outputKey => [possible user keys]
                        outputKey = Object.keys(include)[0];
                        include = include[outputKey];

                        // Check the base key too
                        hasInclude = userIncludes.indexOf(outputKey) > -1;

                        // TODO can make more efficient
                        for (var variationIndex = 0; !hasInclude && variationIndex < include.length; variationIndex++) {
                            hasInclude = userIncludes.indexOf(include[variationIndex]) > -1;
                        }
                    }

                    if (hasInclude) {
                        result.include[outputKey] = hasInclude;
                        result.includeList.push(outputKey);
                    }
                }
            }
        }

        // Normalize entity names and build output map
        if (defined(options.entities)) {
            for (x = 0; x < options.entities.length; x++) {
                var entityKey = options.entities[x];
                var realEntityKey = entityKey + "Id";

                var value = query[realEntityKey];
                if (defined(value)) { // with Id
                    result.params[realEntityKey] = value;
                } else { // without Id
                    value = query[entityKey];
                    if (defined(value)) {
                        result.params[realEntityKey] = value;
                    }
                }
            }
        }

        // Build value map
        if (defined(options.other)) {
            for (x = 0; x < options.other.length; x++) {
                var key = options.other[x];
                if (defined(query[key])) {
                    result.params[key] = query[key];
                }
            }
        }

        return result;
    },

    /**
     * Set the value in output if it exists in the parsed input
     * @param key key to check
     * @param output output map
     * @param input object returned from parse
     * @param [outputKey] key where value is placed (defaults to key)
     */
    setIfExists: function(key, output, input, outputKey) {
        if (defined(input.params[key])) {
            var value = input.params[key];
            if (arguments.length === 3) {
                output[key] = value;
            } else {
                output[outputKey] = value;
            }
        }
    },

    setDateRangeIfExists: function(start, end, output, input, outputKey) {
        var predicate = {};
        var exists = false;
        if (defined(input.params[start])) {

            var startDateMs = parseInt(input.params[start],10);
            predicate.$gte = new Date(startDateMs);
            exists = true;
        }
        if (defined(input.params[end])) {

            var endDateMs = parseInt(input.params[end], 10);
            predicate.$lt = new Date(endDateMs);
            exists = true;
        }

        if (exists) {
            output[outputKey] = predicate;

            console.log("adding date to query (local times): ");
            if(predicate.$gte){
                console.log("Start date: " + predicate.$gte.toDateString());
            }
            if(predicate.$lt){
                console.log("end date: " + predicate.$lt.toDateString());
            }
        }
    },

    // TODO probably move elsewhere
    exists: function(x) {
        return defined(x) && x !== null;
    },

    validateRequestBody: function(req, res, inputs, success) {
        var valid = true;
        var params = {};

        var atLeastOne = defined(inputs.at_least_one) && inputs.at_least_one;
        var validCount = 0;

        for (var key in inputs) {
            if (inputs.hasOwnProperty(key)) {
                if (key === 'at_least_one') {
                    continue;
                }

                var validator = inputs[key];
                valid = validator === null || validator(req.body[key]);
                if (!valid) {
                    responder.rejectWithUserError(res, responder.errors.missing_field, key);
                    break;
                } else {
                    params[key] = req.body[key];
                    validCount++;
                }
            }
        }

        if (valid) {
            if (validCount === 0 && atLeastOne === true) {
                responder.rejectWithUserError(res, responder.errors.missing_field, 'at least one field must be specified');
            } else {
                success(params);
            }
        }
    },

    optional: function(f) {
        return function(x) {
            if (!defined(x) || x === null) {
                return true;
            } else {
                return f(x);
            }
        };
    },

    isBoolean: function(x) {
        return !isNaN(x) && (x === 0 || x === 1 || x === true || x === false);
    },

    isValidString: function(str) {
        return str !== null && (typeof str === 'string' || str instanceof String) && str.length > 0;
    },

    isValidId: function(x) {
        // mongo uses large number keys, so strings are acceptable too
        return x !== null && (!isNaN(x) || module.exports.isValidString(x));
    },

    hasValidProperty: function(object, key, checker) {
        if (defined(object[key])) {
            return checker(object[key]);
        } else {
            return false;
        }
    }
};
