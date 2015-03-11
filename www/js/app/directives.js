'use strict';

var touristmapDirectives = angular.module('touristmapDirectives', []);

touristmapDirectives.directive('infowindow', function(){
    return {
        restrict: 'E',
        templateUrl: 'pages/infowindow.html'
    }
});

touristmapDirectives.directive('placedetails', function(){
    return {
        restrict: 'E',
        scope: { place: '=' },
        templateUrl: 'pages/placedetails.html'
    }
});