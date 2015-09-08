var defined = agquire('ag/utils/defined');
var orm = agquire('ag/db/orm');
var appConfig = agquire('ag/appConfig');
var forEach = agquire('ag/utils/forEachIn');
var Promise = agquire('sequelize/lib/promise');
var Transaction = agquire('ag/db/controllers/Transaction');

/**
 * Return a promise handler that performs authorization checks
 * An error is thrown to break the chain when authorization fails.
 * @param authorizationCallback
 * @returns {Function}
 */
var authHandlerPromise = function(authorizationCallback) {
    return function (entity) {

        if (!defined(entity) || entity === null) {
            throwNoResultError();
        }

        var allowed = true;
        if (authorizationCallback) {
            allowed = authorizationCallback(entity);
        }

        if (!allowed) {
            var Errors = require('../Errors');
            return Promise.reject(new Errors.AuthorizationError());
        }

        return entity;
    };
};

var hasAttribute = function(attr, CheckModel) {
    var rawAttr = CheckModel.rawAttributes[attr];
    return defined(rawAttr) && rawAttr !== null;
};

// Our name -> sequelize name
var resolveAttribute = function(name, CheckModel) {
    if (hasAttribute(name, CheckModel)) {
        return name;
    } else {
        return null;
    }
};

var createParsedQuery = function(dbQuery, options) {
    if (!dbQuery) {
        dbQuery = {};
    }

    if (!options) {
        options = {};
    }

    return {dbQuery: dbQuery, options: options, __query_parsed: true};
};

var parseIfNeeded = function(query, BaseModel) {
    if (!query || !defined(query.__query_parsed)) {
        query = module.exports.parseQueryParams(query, BaseModel);
    }

    return query;
};

var throwNoResultError = function() {
    var Errors = require('../Errors');
    throw new Errors.NoResultError();
};


var rejectWithNoResultError = function(msg){
    var Errors = require('../Errors');
    return Promise.reject(new Errors.NoResultError(msg));
};

var rejectWithValidationError = function(msg) {
    var Errors = require('../Errors');
    return Promise.reject(new Errors.ValidationError(msg));
};

var rejectWithError = function(msg) {
    var Errors = require('../Errors');
    return Promise.reject(new Errors.Error(msg));
};

/**
 * Ensure the given query has a where clause.
 * @param query result from successful invocation of parseQueryParams
 * @param callback called if the query has a where clause.
 * @returns a failing promise if the query has no where clause; otherwise the result of callback.
 */
var ensureQueryHasPredicate = function(query, callback) {
    if (!defined(query.dbQuery.where) || Object.keys(query.dbQuery.where).length === 0) {
        return rejectWithError('no query provided');
    } else {
        return callback(query);
    }
};


// Query should be bound in this filter
var findFilter = function(query) {

    return function(result) {

        if (!result) {
            throwNoResultError();
        }

        var includeFilter = function(entity) {
            for (var x = 0; x < query.options.include.length; x++) {
                var name = query.options.include[x];
                if (defined(entity.dataValues[name])) {
                    // apparently delete is really slow
                    entity.dataValues[name] = undefined;
                    entity[name] = undefined;
                }
            }
        };

        // Remove any needed but unwanted includes
        if (query !== null && defined(query.options.include)) {
            if (Array.isArray(result)) {
                forEach(result, includeFilter);
            } else {
                includeFilter(result);
            }
        }

        // pass onto next
        return result;
    };
};

module.exports = {

    rejectWithNoResultError: rejectWithNoResultError,

    rejectWithValidationError: rejectWithValidationError,

    rejectWithError: rejectWithError,

    authHandlerPromise: authHandlerPromise,


    /**
     * Create a query that searches for a specific id if params
     * is not a query. Otherwise, return original query.
     * @param identifierOrQuery query or identifier
     */
    createParamsForIdIfRequired: function(identifierOrQuery) {
        if (!isNaN(identifierOrQuery)) {
            identifierOrQuery = {where: {id: identifierOrQuery}};
        }
        return identifierOrQuery;
    },

    /**
     * Move attributes from the where root into a relation
     * @param params params that would be passed into parseQueryParams
     * @param relation relation to move to
     * @param attributes attributes to move
     */
    moveAttributesIntoRelation: function(params, relation, attributes) {
        if (params && params.where) {
            for (var x = 0; x < attributes.length; x++) {
                var attribute = attributes[x];
                if (defined(params.where[attribute])) {
                    params.where[relation + '.' + attribute] = params.where[attribute];
                    delete params.where[attribute];
                }
            }
        }
    },

    /**
     * Parse the generic query format which is of the form:
     *
     * {
     *  where: {animalId: 5, algorithmId: 4, 'animal.farmId' : 4, ...},
     *  include: ['animal', 'user', 'algorithm', ...],
     *  offset: 100,
     *  limit: 50,
     *  order: {by: 'timeStamp' sort: 'ascending'}
     * }
     *
     * The object returned is of the form:
     *
     * {
     *      dbQuery: { ... },
     *      options: { ... },
     * }
     *
     * The returned object can be treated as completely opaque and passed
     * into other methods defined in this file. You can also pass the dbQuery
     * object directly to Sequelize, although that's not recommended. Some cleanup
     * may be required and this is described in options. Methods in this file will
     * take care of any cleanup automatically.
     *
     * @param params params of the above format
     * @param BaseModel model to use
     * @returns {{}} object of above format
     */
    parseQueryParams: function(params, BaseModel) {

        if (!params) {
            return createParsedQuery(null, null);
        }

        // quick and dirty check to see if params is an instance of a model
        if (defined(params.dataValues)) {
            throw new Error('You probably called these methods incorrectly.');
        }

        var query = {};
        var options = {};

        var throwModelError = function(msg, Model) {
            if (arguments.length === 1) {
                Model = BaseModel;
            }
            throw new Error(msg + " for model '" + Model.modelName + "'");
        };

        if (BaseModel === null || !defined(BaseModel.rawAttributes)) {
            throwModelError("cannot retrieve attributes");
        }

        var addInclude = function(include, rootInclude) {

            // Model is the model to include into
            var Model = BaseModel;

            if (arguments.length > 1 && rootInclude !== null) {
                Model = rootInclude.model;
            }

            var queryInclude = Model.includeForRelation(include);
            if (queryInclude === null) {
                throwModelError("cannot find relation '" + include + "'", Model);
            }

            includes[include] = queryInclude;

            // Only include in the root object if it's for the base model
            if (Model === BaseModel) {
                query.include.push(queryInclude);
            } else {
                if (!defined(rootInclude.include)) {
                    rootInclude.include = [];
                }
                rootInclude.include.push(queryInclude);
            }

            return queryInclude;
        };

        var findInclude = function(name) {
            var inc = includes[name];
            if (!defined(inc)) {
                return null;
            } else {
                return inc;
            }
        };

        var addHierarchicalIncludes = function(parts) {

            var prevInclude = null;
            for (var x = 0; x < parts.length; x++) {
                var rootIncludeName = parts[x];
                var inc = findInclude(rootIncludeName);
                if (inc === null) {
                    inc = addInclude(rootIncludeName, prevInclude);
                }
                prevInclude = inc;
            }
        };

        var addPredicate = function(attribute, value, where, CheckModel) {
            var seqAttribute = resolveAttribute(attribute, CheckModel);
            if (seqAttribute !== null) {
                where[seqAttribute] = value;
            } else {
                throwModelError("unknown attribute '" + attribute + "'");
            }
        };


        // includes maps include names (e.g. animal) to the include structure
        var includes = {};
        query.include = [];

        if (defined(params.include)) {
            if (!Array.isArray(params.include)) {
                throw new Error("includes should be an array");
            }

            for (var x = 0; x < params.include.length; x++) {
                var include = params.include[x];

                var parts = include.split('.');
                if (parts.length > 1) {
                    addHierarchicalIncludes(parts);
                } else {
                    addInclude(include);
                }
            }
        }

        // Process the where clause
        if (defined(params.where)) {
            query.where = {};
            for (var attribute in params.where) {
                if (params.where.hasOwnProperty(attribute)) {
                    var value = params.where[attribute];
                    var parts = attribute.split('.');

                    // TODO Only support animal.farmId and not animal.farm.id for now.
                    if (parts.length > 2) {
                        throw new Error("no more than 1-depth predicates are currently supported ('" + attribute + "')");
                    }

                    if (parts.length > 1) {

                        var includeName = parts[0];
                        var inc = includes[includeName];
                        if (!defined(inc)) {
                            // If there was no previous include, then the caller doesn't
                            // actually care about the include and they just want to filter
                            // on it. So we want to remove it from returned objects once
                            // the query is done.
                            inc = addInclude(includeName);
                            if (!defined(options.include)) {
                                options.include = [];
                            }
                            options.include.push(includeName);
                        }

                        if (!defined(inc.where)) {
                            inc.where = {};
                        }
                        addPredicate(parts[1], value, inc.where, inc.model);
                    } else {
                        // 0 depth
                        addPredicate(attribute, value, query.where, BaseModel);
                    }
                }
            }
        }


        if (defined(params.offset)) {
            query.offset = params.offset;
        } else {
            query.offset = 0;
        }

        // TODO this is so that an error is raised if a query would exceed the maximum
        // TODO should probably change this later to return a subset of data with no error
        var maxLength = appConfig.kMaxQueryLength + 1;
        if (defined(params.limit)) {
            query.limit = params.limit > maxLength ? maxLength : params.limit;
        } else {
            query.limit = maxLength;
        }

        if (defined(params.order)) {
            if (!defined(params.order.by)) {
                throw new Error("no order.by attribute specified");
            }
            if (!defined(params.order.sort)) {
                throw new Error("no order.sort attribute specified");
            }

            // TODO can't sort by sub attributes (e.g. animal.farm.name) for now
            var orderBy = resolveAttribute(params.order.by, BaseModel);
            var sortBy = params.order.sort.toLowerCase();

            if (orderBy === null) {
                throwModelError("attempted to order by unknown attribute '" + orderBy + "'");
            }

            var sortMap = {"asc": "ASC", "desc": "DESC", "ascending":"ASC", "descending":"DESC"};
            var realSort = sortMap[sortBy];
            if (realSort === null) {
                throw new Error("unknown sorting method '" + sortBy + "'");
            }

            query.order = [[orderBy, realSort]];
        } else {
            query.order = [['createdAt', 'DESC']];
        }

        return createParsedQuery(query, options);
    },

    removeOne: function(Model, query, authCallback) {
        query = parseIfNeeded(query, Model);

        return ensureQueryHasPredicate(query, function() {
            return Model.findOne(query.dbQuery)
                .then(authHandlerPromise(authCallback))
                .then(function(entity) {
                    return entity.destroy().then(function() {
                        return entity;
                    });
                });
        });
    },

    removeEntity: function(entity, authCallback) {

        return Promise.resolve().then(function() {return entity;}).then(authHandlerPromise(authCallback))
            .then(function() {
                return entity.destroy();
            });

    },

    updateOne: function(Model, query, authCallback, workCallback) {
        query = parseIfNeeded(query, Model, true);

        return ensureQueryHasPredicate(query, function() {
            // TODO check data flow (i.e. does save return anything)
            return Model.findOne(query.dbQuery)
                .then(authHandlerPromise(authCallback))
                .then(function(entity) {
                    var work = workCallback(entity);
                    if (defined(work) && work !== null) {
                        // TODO check semantics of Promise.join and maybe use that
                        // TODO i'm not sure if joined promises are executed concurrently or not
                        // TODO so being explicit for now
                        return work.then(function() {
                            return module.exports.saveEntity(entity);
                        });
                        //return Promise.join(work, module.exports.saveEntity(entity));
                    } else {
                        return module.exports.saveEntity(entity);
                    }
                });
        });
    },

    saveEntity: function(entity) {
        return entity.save();
    },

    findOne: function(Model, query) {

        query = parseIfNeeded(query, Model);

        return ensureQueryHasPredicate(query, function() {
            return Model.findOne(query.dbQuery)
                .then(findFilter(query));
        });
    },

    findOrCreate: function(Model, where, defaults) {
        if (arguments.length === 2 || defaults === null) {
            defaults = where;
        }

        // TODO remove this workaround when issue is fixed
        // https://github.com/sequelize/sequelize/issues/4333
        var t = Transaction.currentTransaction();
        if (!t) {
            return Transaction.begin(function(t) {
                // We don't parse this query because includes, etc. don't work
                return Model.findOrCreate({where: where, defaults: defaults, transaction: t});
            });
        } else {
            // We don't parse this query because includes, etc. don't work
            return Model.findOrCreate({where: where, defaults: defaults, transaction: t});
        }
    },

    findOrCreateEntityOnly: function(Model, query, defaults) {
        return module.exports.findOrCreate(Model, query, defaults)
            .spread(function(entity, created) {
                return entity;
            });
    },

    findAll: function(Model, query) {

        query = parseIfNeeded(query, Model);

        return Model.findAll(query.dbQuery)
            .then(findFilter(query));
    },

    count: function(Model, query) {

        query = parseIfNeeded(query, Model);

        var actualQuery = {where: query.dbQuery.where, include: query.dbQuery.include};

        return Model.count(actualQuery);
    },

    createOne: function(Model, attributes) {
        return Model.create(attributes);
    }
};

var helpers = module.exports;
