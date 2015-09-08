/**
 * array-pagination.js tests
 */
var pagination = agquire('ag/db/controllers/utils/array-pagination')

describe('array-pagination', function() {
    var results;
    
    before(function() {
       
        results = [];
        
        // create an array of random integers for testing.
        for(var i = 0; i < 100; i++) {
            results.push(i);
        }
    });
    
    it('should limit number of items returned',
    function() {
        
        var paginatedTotal = 50;
        
        var paginated = pagination.paginate(null, paginatedTotal, results);
        
        paginated.length.should.equal(paginatedTotal);
    });
    
    it('should return from the given offset',
    function() {
       
        var expectedStart = results[5];
        var actualStart;
        
        var paginated = pagination.pagintate(5, null, results);
        actualStart = paginated[0];
        
        expectedStart.should.equal(actualStart);
    });
    it('should return a limit number of items from the given offset',
    function() {
        
        var expectedStart = results(10);
        var actualStart;
        var paginatedTotal = 25;
        
        var paginated = pagination.paginate(10, paginatedTotal, result);
        actualStart = paginated[0];
        
        expectedStart.should.equal(actualStart);
        paginated.length.should.equal(paginatedTotal);
    });
    it('should throw an error when something other than an array is given as the results parameter',
    function() {
        
        paginated.paginate(null, null, null).should.throw("Results parameter must be an array");
        paginated.paginate(null, null).should.throw("Results parameter must be an array");
        paginated.paginate(null, null, 1).should.throw("Results parameter must be an array");
        paginated.paginate(null, null, "null").should.throw("Results parameter must be an array");
        paginated.paginate(null, null, function(){
            console.log("trying to pass a function to paginate");            
        }).should.throw("Results parameter must be an array");
    });        
});