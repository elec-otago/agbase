/**
 * Unit tests for the condition scores graph page.
 * 
 * Author: John Harborne
 * */

var jsonAnimals = [{id:962,eid:null,vid:577,HerdId:6,FarmId:3},{id:965,eid:null,vid:263,HerdId:6,FarmId:3}];
var jsonWeights = [{id:11310,w05:3.4,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:962,UserId:2},
{id:11313,w05:3.5,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:965,UserId:2},
{id:11323,w05:4,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:975,UserId:2},
{id:11328,w05:4,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:980,UserId:2},
{id:11318,w05:3.5,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:970,UserId:2},
{id:11331,w05:4,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:983,UserId:2},
{id:11325,w05:4,w25:0,w50:0,w75:null,w95:null,timeStamp:'2015-02-28T11:00:00.000Z',comment:null,AlgorithmId:1,AnimalId:977,UserId:2}];

describe('Condition Scores Controller', function () {
    beforeEach(function() {
        angular.mock.module( 'ngMoogle' );
    });
    
    describe('ConditionScoresCtrl', function() {
        var scope, ctrl, service, $httpBackend;
        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller,_FarmService_ ,_MeasurementService_,_AnimalService_,_HerdService_,_AlgorithmService_,_CategoryService_) {
            console.log('*** IN INJECT!! ***');
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $controller('ConditionScoresCtrl', {
                $scope: scope,
                FarmService: _FarmService_,
                MeasurementService: _MeasurementService_,
                AnimalService: _AnimalService_,
                HerdService: _HerdService_,
                AlgorithmService: _AlgorithmService_,
                CategoryService: _CategoryService_
                
            });
            console.log(ctrl);
        }));  
        
        it('testing scope', function () {
            var data = scope.data[0];
            describe('testing scope.data to see if is set on run', function () {
                expect(data.label).toEqual("Scores VS Quantity");
            });
        });
        
        xit('testing getMeasurementsList', function () {
            $httpBackend.whenGET('https://localhost:9018/api/animals/?farmId=3&herdId=6').respond(jsonAnimals);
            $httpBackend.whenGET('https://localhost:9018/api/measurements/?algorithm=1&animal=962').respond(jsonWeights,function()
            {
                console.log("got some measuremts");
            }
            );
            var imp = {farm:{id:3,name:'Demo Farm'},herd:{id:6,name:'Demo Herd 1',FarmId:3}};
            scope.getMeasurementsList(imp);
            describe('testing to see if scope.table gets any data added to it', function () {
                expect(scope.table.length).toBeGreaterThan(0);
            });
        });
    });
});

