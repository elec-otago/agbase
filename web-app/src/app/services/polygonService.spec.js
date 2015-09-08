/**
 * Unit tests for the Polygon utility functions
 * 
 * Author: Tim Molteno.
 * */

describe('PolygonService', function () {
    
   var Polygon;
   
    beforeEach(function(){
        
      angular.mock.module( 'ngMoogle' );  
      inject(function(_PolygonService_){
            Polygon = _PolygonService_;
        });
    });    
    
    

    it('Point', function () {
         var a = new Polygon.Point(1,2);
         var b = new Polygon.Point(2,3);

         expect(a.x).toEqual(1);
         expect(a.y).toEqual(2);
    });


    it('3-Point Polygon Intersection', function () {
        var a = new Polygon.Point(1,2);
        var b = new Polygon.Point(3,1);
        var c = new Polygon.Point(2,3);

        var vertexes = [a,b,c];

        /**
        * 
        *       c
        * 
        *       ?
        * 
        *   a       b
        * 
        * * * * * * * * * *
        * */
        describe('checking should not change length of vertices', function () {
                expect(vertexes.length).toEqual(3);
        });

        describe('says vertex a is outside', function () {
                expect(Polygon.pointInside(vertexes, a)).toBe(false);
        });
        describe('says vertex b is outside', function () {
                expect(Polygon.pointInside(vertexes, b)).toBe(false);
        });
        describe('says vertex c is outside', function () {
                expect(Polygon.pointInside(vertexes, c)).toBe(false);
        });

        describe('says points outside should return false', function () {
                var d = new Polygon.Point(0,4);
                expect(Polygon.pointInside(vertexes, d)).toBe(false);
        });

        describe('says that points inside should return true', function () {
                expect(Polygon.pointInside(vertexes, new Polygon.Point(2,2))).toBe(true);
                expect(Polygon.pointInside(vertexes, new Polygon.Point(2,2.5))).toBe(true);
        });

        describe('says that rearranging points inside should still return true', function () {
                var d = new Polygon.Point(2,2);
                expect(Polygon.pointInside([a,c,b], d)).toBe(true);
        });

    });

// 
//     it('4-Point Polygon Intersection', function () {
//     var a = new Polygon.Point(1,2);
//     var b = new Polygon.Point(3,1);
//     var c = new Polygon.Point(2,3);
//     var d = new Polygon.Point(4,3);
// 
//     var vertexes = [a,b,d,c];
// 
//     /**
//         * 
//         *       c       d
//         * 
//         *       ?   ?
//         * 
//         *   a       b
//         * 
//         * * * * * * * * * *
//         * */
//     it('checking should not change length of vertices', function () {
//             expect(vertexes.length).toEqual(4);
//     });
// 
//     it('says vertexes are outside', function () {
//             vertexes.forEach(function(v) {
//             expect(Polygon.pointInside(vertexes, v)).toBe(false);
//             });
//     });
// 
//     it('says points outside should return false', function () {
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(0,4))).toBe(false);
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(100,4))).toBe(false);
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(4.01,3.01))).toBe(false);
//     });
// 
//     it('says point [2,2] should be inside', function () {
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(2,2))).toBe(true);
//     });
// 
//     it('says point [3,2] should be inside', function () {
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(3,2))).toBe(true);
//     });
// 
//     });
// 
// 
// 
//     it('Non simple 4-Point Polygon', function () {
//     var a = new Polygon.Point(1,2);
//     var b = new Polygon.Point(3,1);
//     var c = new Polygon.Point(2,3);
//     var d = new Polygon.Point(4,3);
// 
//     var vertexes = [a,b,c,d];
// 
//     /**
//         * 
//         *       c       d
//         * 
//         *       ?   ?
//         * 
//         *   a       b
//         * 
//         * * * * * * * * * *
//         * */   
//     it('says vertexes are outside', function () {
//             vertexes.forEach(function(v) {
//             expect(Polygon.pointInside(vertexes, v)).toBe(false);
//             });
//     });
// 
//     it('says points outside should return false', function () {
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(0,4))).toBe(false);
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(100,4))).toBe(false);
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(4.01,3.01))).toBe(false);
//     });
// 
//     it('says point [1.9,2] should be outside', function () {
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(1.9,2))).toBe(true);
//     });
// 
//     //    it('says point [3,2.5] should be inside', function () {
//     //         expect(Polygon.pointInside(vertexes, new Polygon.Point(3,2.5))).toBe(true);
//     //    });
// 
//     it('says point [2,1.5] should be inside', function () {
//             expect(Polygon.pointInside(vertexes, new Polygon.Point(2,1.5))).toBe(true);
//     });
// 
//     });*/

});
