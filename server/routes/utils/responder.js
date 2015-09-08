var defined = agquire('ag/utils/defined');

module.exports = {

    /**
     * Respond to the user with the result of the specified promise.
     * promiseBundle describes the promise and how it should be presented
     * to the user, there are two variations:
     *
     * {
     *      key_name: promise
     * }
     *
     * or
     *
     * {
     *      promise: promise
     *      [name]: name
     * }
     *
     *
     * Note: You should only use this version over respondAndAuth when you
     * need to execute the query before you can perform auth checks.
     *
     * @param res
     * @param promiseBundle promise bundle which has form described above.
     */
    respond: function(res, promiseBundle) {

        var promise = null;
        var name = null;

        if (defined(promiseBundle.promise)) {
            promise = promiseBundle.promise;
            if (defined(promiseBundle.name)) {
                name = promiseBundle.name;
            }
        } else {
            var keys = Object.keys(promiseBundle);
            if (keys.length !== 1) {
                console.log('respond called incorrectly');
                res.sendStatus(500);
                return;
            }

            name = keys[0];
            promise = promiseBundle[name];
        }

        promise.then(function(result) {
            if (!defined(result) || result === null) {
                result = {};
            }

            if (name !== null) {
                var namedResult = {};
                namedResult[name] = result;
                result = namedResult;
            }

            res.json(result);

        }).catch(function(err) {
            // TODO Probably use error codes or something
            // TODO also use http codes in a better way
            console.log(err.stack);
            res.status(422).json({error: err.message});
        });
    },

    /**
     * Similar to respond but performs authorization before executing
     * the promise.
     * @param req
     * @param res
     * @param access
     * @param promiseFactory
     */
    authAndRespond: function(req, res, access, promiseFactory) {
        var allowed = req.user.requiresAccess(access, function (why) {
            if (!why) {
                why = "Unauthorized";
            }
            res.status(403).json({error: why});
        });

        if (allowed) {
            module.exports.respond(res, promiseFactory());
        }
    },

    rejectWithUserError: function(res, code, detail) {

        var msg = null;
        var result = null;
        if (code) {
            result = {code: code};
            if (defined(module.exports.messages[code])) {
                msg = module.exports.messages[code];
                if (defined(detail) && detail !== null) {
                    msg = msg + ' (' + detail + ')';
                }

                result.reason = msg;
            }
        } else {
            if (defined(detail) && detail !== null) {
                result = {reason: detail};
            }
        }

        if (result !== null) {
            res.status(422).json(result);
            console.log(result);
        } else {
            res.sendStatus(422);
        }
    },

    errors: {
        missing_field: 1024,
        bad_request: 1025
    },

    messages: {
        1024: 'Required field is missing or invalid',
        1025: 'Your request cannot be processed'
    }
};