var app = angular.module( 'ngMoogle', [
  'templates-app',
  'templates-common',
  'appServices',
  'ngMoogle.home',
    'ngMoogle.login',
    'ngMoogle.signup',

  'ui.router',
  'angular-loading-bar'
]);

var appServices = angular.module('appServices', []);
var options = {};
options.api = {};
options.appInfo = {};
options.api.base_url = "https://" +  window.location.host + "/api";
options.appInfo.version = "{{ VERSION }}";
options.appInfo.buildDate = "{{ BUILD_DATE }}";
options.appInfo.name = "AgBase";


app.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider ,$logProvider) {

        $locationProvider.html5Mode(true); //incorporates base url specified in index.html header, rewrites relative links
        $logProvider.debugEnabled(true); //output logs
        $httpProvider.interceptors.push('TokenInterceptor'); //attach JWT onto all requests once it is present
});


app.config(function($compileProvider){
    //overrides the default regular expression that is used for whitelisting of safe urls during a[href] sanitization
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
});


/*
* Run gets executed after the injector is created and is used to kickstart the application.
* At this point all services have been initiated.
*/
app.run(['$rootScope', '$state', '$window', 'AuthenticationService','$stateParams','$log',
    function($root, $state , $window, authService, $stateParams, $log) {

        $log.debug("AgBase Web app starting");

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $root.$state = $state;
        $root.$stateParams = $stateParams;

        //$state.go('home'); //by default we always go straight to the home state

        /*
         * Look at every state change (including the first transition to home and check the user is still authenticated
         * Unauthenticated users get immediately redirected to the login screen
         */
        $root.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

            var isLoginState = toState.name === "login";

            if (isLoginState) {
                if(authService.isAuthenticated || window.sessionStorage.token){
                    event.preventDefault(); //prevent the original link from being followed
                    $state.go('home.dashboard'); //don't show log in screen if there is a current user
                }
                //else already heading to login screen

                return;
            }

            var shouldRequireLogin = !authService.isAuthenticated && !window.sessionStorage.token;

            if (shouldRequireLogin) {

                event.preventDefault(); //prevent the original link from being followed
                $state.go('login');
                return;
            }

            if (toState.redirectTo) {
                event.preventDefault();
                $state.go(toState.redirectTo, toParams);
            }
        });
    }
]);


app.config(
    [ '$stateProvider', '$urlRouterProvider',
        function ($stateProvider,   $urlRouterProvider) {

            /////////////////////////////
            // Redirects and Otherwise //
            /////////////////////////////

            // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
            $urlRouterProvider

                // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
                // Here we are just setting up some convenience urls.
                .when('', '/dashboard')

                // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
                .otherwise('/dashboard');
        }
    ]
);


/*
 * Main Controller for our AgBase Web App
 */
app.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $window ) {

    //update page title on state change
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | '+ options.appInfo.name ;
            console.log("New State " + toState.name);
        }

    });

    //emitted every time view content is loaded
    $scope.$on('$viewContentLoaded', function(event) {

        $window.ga('send', 'pageview', {page: $location.url()}); //send tracking event to google analytics
    });
  
});
