'use strict';

var touristmapFilters = angular.module('touristmapFilters', []);

touristmapFilters.filter('category', ['Category', function(Category) {
    return function(input) {
        return Category.getCategory(input);
    };
}]);