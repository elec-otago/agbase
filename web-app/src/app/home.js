var loadNav = function(){

    var topOffset = 50;
    var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
        $('div.navbar-collapse').addClass('collapse');
        topOffset = 100; // 2-row-menu
    } else {
        $('div.navbar-collapse').removeClass('collapse');
    }

    var height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
    height = height - topOffset;

    if (height < 1) {
        height = 1;
    }
    if (height > topOffset) {
        $("#page-wrapper").css("min-height", (height) + "px");
    }
};

angular.module( 'ngMoogle.home', [
  'ui.router',
  'ngMoogle.dashboard',
  'ngMoogle.farm',
  'ngMoogle.profile',
  'ngMoogle.settings',
  'ngMoogle.admin',
  'ngMoogle.apps',
  'ngMoogle.reports'
])


.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
      // With abstract set to true, that means this state can not be explicitly activated.
      // It can only be implicitly activated by activating one of its children.
      abstract: true,

    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

.controller( 'HomeCtrl', function HomeController( $scope, $state, $sce, $ag, UserService) {

    console.log("Loading AgBase Web App Home");

    $scope.$state = $state;

    $scope.$on('$viewContentLoaded', function() {

            $('#side-menu').metisMenu();

            $(window).bind("load resize", function() {
                loadNav();
            });

            loadNav();
    });

    $scope.userFarms = [];


    var updateUserFarmsOnScope = function(){

        UserService.flushUserData().then(function(farms){

            $scope.userFarms = farms;
            $scope.firstUserFarm = farms.length > 0 ? farms[0] : null;
            $scope.userFarmPermissions = [];

            $ag.forEachIn(farms, function(farm){

                $scope.userFarmPermissions.push(farm.permission);

            });
        });
    };

    $scope.updateUserFarmsOnScope = updateUserFarmsOnScope();

    var user = UserService.getCurrentUser();

    if(!user){
        $state.go("login");
    }else{

        $scope.userFullName = user.firstName + " " + user.lastName;

        updateUserFarmsOnScope();

        $scope.isAdmin = (user.role.name == "admin" || user.role.name == "wizard");
        $scope.user = user;
    }


    $scope.showLoading = function(){
        $("#ProgressModal").modal('show');
    };

    $scope.hideLoading = function(){
        $("#ProgressModal").modal('hide');
    };

    $scope.toggleLoading = function toggleLoading(){
        if(!$scope.loadingCounter) {
            $scope.loadingCounter = setTimeout($scope.showLoading, 2000);
        }else{
            clearTimeout($scope.loadingCounter);
            $scope.loadingCounter = null;
            setTimeout($scope.hideLoading, 1000);
        }
    };

    $scope.logOut = function logOut() {

        UserService.logOut().then(function(){
            $state.go("login");
        });
    };

    var openDocs = function(urlExtension){

        var docUrl = "https://" +  window.location.host + "/doc/" + urlExtension;

        var win = window.open(docUrl, '_blank');
        win.focus();
    };

    $scope.openAPIDocs = function(){

      openDocs('api/');
    };

    $scope.openNgDocs = function(){

      openDocs('ng/');
    };

    $scope.goToLanding = function(){

        var landingUrl = "https://" +  window.location.host;

        window.location = landingUrl;
    };
});

