/**
 * Created by mark on 16/10/14.
 */


angular.module( 'ngMoogle.signup', [
    'ui.router'
])

    .config(function config( $stateProvider ) {
        $stateProvider.state( 'signup', {
            url: '/signup',
            views: {
                "main": {
                    controller: 'SignupCtrl',
                    templateUrl: 'signup/signup.tpl.html'
                }
            },
            data:{ pageTitle: 'Create an Account' }
        });
    })

    .controller('SignupCtrl', ['$scope', '$location', '$window', 'UserService', '$state',
        function SignupCtrl($scope, $location, $window, UserService, $state) {

        }
    ]);
