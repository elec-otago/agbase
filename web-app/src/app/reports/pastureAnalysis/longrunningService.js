/**
 * 
 * 
 * $scope.results = longrunningService.responsiveMap(initialdata, function() {
 *     // Long-running or computationally intense code here
 *     return result;
 * });
 * 
 * 
 * 
 * 
 * 
 * */

appServices.service('longrunningService', function($q, $timeout) {
    var self = this;

    // Works like map() except it uses setTimeout between each loop iteration
    self.responsiveMap = function(collection, evalFn)
    {
        var deferred = $q.defer();

        // Closures to track the resulting collection as it's built and the iteration index
        var resultCollection = [], index = 0;

        function enQueueNext() {
            $timeout(function () {
                // Process the element at "index"
                resultCollection.push(evalFn(collection[index]));

                index++;
                if (index < collection.length) {
                    enQueueNext();
                } else {
                    // We're done; resolve the promise
                    deferred.resolve(resultCollection);
                }
            }, 0);
        }

        // Start off the process
        enQueueNext();

        return deferred.promise;
    };

    return self;
});
