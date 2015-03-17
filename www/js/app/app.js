'use strict';

var touristmapApp = angular.module('touristmapApp', [
    'ngRoute',
    'ngAnimate',
    'touristmapControllers',
    'touristmapServices',
    'touristmapDirectives',
    'touristmapFilters',
    'pascalprecht.translate'
]);

touristmapApp.config(['$routeProvider', '$translateProvider', function($routeProvider, $translateProvider){
    $routeProvider
        .when('/', {
            templateUrl : 'pages/home.html',
            controller  : 'HomeController'
        })
        .when('/home/:lat?/:lng?', {
            templateUrl : 'pages/home.html',
            controller  : 'HomeController'
        })
        .when('/list', {
            templateUrl : 'pages/list.html',
            controller  : 'ListController'
        })
        .when('/addplace', {
            templateUrl : 'pages/addplace.html',
            controller  : 'AddPlaceController'
        })
        .when('/settings', {
            templateUrl : 'pages/settings.html',
            controller  : 'SettingsController'
        })
        .when('/404', {
            templateUrl : 'pages/404.html',
            controller  : 'NotFoundController'
        })
        .otherwise({
            redirectTo: '/404'
        });

    $translateProvider.useStaticFilesLoader({
        prefix: '../www/languages/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage(GLOBAL_LANGUAGE);
}]);

/*touristmapApp.run(function() {
    new FastClick(document.body);
});*/