'use strict';

var touristmapDirectives = angular.module('touristmapDirectives', []);

touristmapDirectives.directive('infowindow', function(){
    return {
        restrict: 'E',
        templateUrl: 'pages/infowindow.html'
    }
});