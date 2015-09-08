xdescribe('Calculate Grid', function () {
    beforeEach(function() {
        angular.mock.module( 'ngMoogle' );
    });

    var scope, ctrl, timeout, service, $httpBackend;
    beforeEach(inject(function(_$httpBackend_, $timeout, $rootScope, $controller, _HerdService_, _AnimalService_, _MeasurementService_, _AlgorithmService_) {
        $httpBackend = _$httpBackend_;
        timeout = $timeout;
        scope = $rootScope.$new();
        ctrl = $controller('pastureAnalysisReportCtrl', {
            $scope: scope,
            HerdService:  _HerdService_,
            AnimalService: _AnimalService_,
            MeasurementService:_MeasurementService_,
            AlgorithmService:_AlgorithmService_
        });
    }));  
    
    
});