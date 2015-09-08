/**
 * Created by mark on 16/10/14.
 */


angular.module( 'ngMoogle.login', [
    'ui.router'
])

    .config(function config( $stateProvider ) {
        $stateProvider.state( 'login', {
            url: '/login',
            views: {
                "main": {
                    controller: 'LoginCtrl',
                    templateUrl: 'login/login.tpl.html'
                }
            },
            data:{ pageTitle: 'Login' }
        });
    })

    .controller('LoginCtrl', ['$scope', '$location', '$window', 'UserService', '$state',
        function LoginCtrl($scope, $location, $window, UserService, $state) {

            console.log("Loading AgBase Web App Login");
            if(UserService.hasAutoLogin()){

                UserService.autoLogin(function(err){
                    if(err){
                        console.log(err);
                        return;
                    }
                    $state.go('home.dashboard');
                });
            }

            $scope.$state = $state;

            $scope.loginFailed = false;

            $scope.signIn = function signIn(email, password) {

                $scope.loginFailed = false;
                if (!email || !password) {

                    email = $("#inputEmail").val();
                    password = $("#inputPassword").val();
                }
                var rememberMe = $("#rememberMe").prop('checked');
                UserService.logIn(email, password, rememberMe).success(function () {

                    $state.go('home.dashboard');

                }).error(function(err) {

                    $scope.loginFailed = true;
                    $scope.message = {is_error: true, message: 'Login Failed!'};

                });
            };

            $scope.logOut = function logOut() {
                UserService.logOut().complete(function () {
                    $state.go('login');

                });
            };

        }
    ]);
