'use strict';

var touristmapControllers = angular.module('touristmapControllers', []);

touristmapControllers.controller('MainController', ['$scope', 'GlobalMap', 'Place', 'MyLocation',  function($scope, GlobalMap, Place, MyLocation) {
    $(document).foundation({
        reveal : {
            close_on_background_click: false,
            animation: null
        }
    });

    if(!Platform.isPC()) {
        spinnerplugin.show();
    }

    $scope.closeRoute = function() {
        $('.off-canvas-wrap').removeClass('offcanvas-overlap-left');
        GlobalMap.closeRoute();
        GlobalMap.setRoute(false);
    };

}]);

touristmapControllers.controller('HomeController', ['$scope', 'GlobalMap', 'Place', 'MyLocation', '$routeParams', 'Starter', function($scope, GlobalMap, Place, MyLocation, $routeParams, Starter) {
    $(document).foundation({
        reveal : {
            close_on_background_click: false,
            animation: null
        }
    });

    Starter.start($scope, $routeParams);

    $scope.calcRoute = function(destination, type) {
        GlobalMap.switchRoute(true);
        $scope.infowindow.close();
        GlobalMap.calcRoute(MyLocation, destination, type);
    };
}]);

touristmapControllers.controller('ListController', ['$scope', 'Place', 'GlobalMap', '$filter', function($scope, Place, GlobalMap, $filter) {
    $(document).foundation({
        reveal : {
            close_on_background_click: false,
            animation: null
        }
    });
    GlobalMap.switchRoute(false);
    $scope.list = Place.getPlaces();
    $scope.selectItems = [
        $filter('translate')("ALL_DATA"),
        $filter('translate')("TITLE"),
        $filter('translate')("SHORT_DESCRIPTION"),
        $filter('translate')("CATEGORY")
    ];
    $scope.search = {
        $: '',
        info: {
            title: '',
            description: {
                short: '',
                long: ''
            }
        },
        categoryFilter: ''
    };

    $scope.changeFilter = function() {
        $scope.value = '';
        $scope.search.$ = '';
        $scope.search.info.title = '';
        $scope.search.info.description.short = '';
        $scope.search.categoryFilter = '';
        switch ($scope.selectedFilter) {
            case $filter('translate')("ALL_DATA"):
            case $filter('translate')("TITLE"): {
                $scope.orderParam = 'info.title';
                break;
            }
            case $filter('translate')("SHORT_DESCRIPTION"): {
                $scope.orderParam = 'info.description.short';
                break;
            }
            case $filter('translate')("CATEGORY"): {
                $scope.orderParam = 'categoryFilter';
                break;
            }
        }
    };

    $scope.changeQuery = function () {
        switch ($scope.selectedFilter) {
            case $filter('translate')("ALL_DATA"): {
                $scope.search.$ = $scope.value;
                break;
            }
            case $filter('translate')("TITLE"): {
                $scope.search.info = {
                    title: $scope.value,
                    description : {
                        short: ''
                    }
                };
                break;
            }
            case $filter('translate')("SHORT_DESCRIPTION"): {
                $scope.search.info = {
                    title: '',
                    description : {
                        short: $scope.value
                    }
                };
                break;
            }
            case $filter('translate')("CATEGORY"): {
                $scope.search.categoryFilter = $scope.value;
                break;
            }
        }
    };

    $scope.initSelect = function () {
        $scope.orderParam = 'info.title';
        return $filter('translate')("ALL_DATA");
    };

    $scope.toModalDetails = function(place) {
        $scope.placeDetails = place;
    };

    $scope.goToMap = function(location) {
        window.location = "#home/" + location.lat + "/" + location.lng;
    }
}]);

touristmapControllers.controller('AddPlaceController', ['$scope', 'GlobalMap', 'Place', '$filter', 'Category', function($scope, GlobalMap, Place, $filter, Category) {
    $(document).foundation({
        reveal : {
            close_on_background_click: false,
            animation: null
        }
    });

    $scope.maxLength = 150;

    $scope.categories = Category.list;

    GlobalMap.switchRoute(false);
    $scope.photo = false;
    var local_map = document.getElementById("add_map_canvas");
    if(local_map) {
        GlobalMap.initialize(local_map, true, $scope);
    }

    function addPlaceWrap() {
        Place.uploadPhoto($scope.place, Place.addPlace, $scope.file);
    }

    function captureWrap(){
        Place.capturePhoto($scope);
    }

    function openWrap(){
        Place.openPhoto($scope);
    }

    function goBack() {
        $(document).foundation('reveal', 'close');
    }

    $scope.isPC = function() {
        return Platform.isPC();
    };

    function onFileSelected(event) {
        var selectedFile = event.target.files[0];
        var reader = new FileReader();

        var imgtag = document.getElementById("imageFromPC");
        $scope.file = selectedFile;

        reader.onload = function(event) {
            imgtag.src = event.target.result;
            $scope.photo = true;
            $scope.$apply();
        };

        reader.readAsDataURL(selectedFile);
    }

    if(Platform.isPC()) {
        var uploadInput = document.getElementById("uploadInput");
        uploadInput.onchange = onFileSelected;
    } else {
        var capturePhoto = document.getElementById('capturePhoto');
        var openPhoto = document.getElementById('openPhoto');
        capturePhoto.addEventListener('click', captureWrap, false);
        openPhoto.addEventListener('click', openWrap, false);
    }
    var addPlace = document.getElementById('addPlace');
    var goBackButton = document.getElementById('goBackButton');
    addPlace.addEventListener('click', addPlaceWrap, false);
    goBackButton.addEventListener('click', goBack, false);
}]);

touristmapControllers.controller('SettingsController', ['$scope', 'GlobalMap', '$translate', function($scope, GlobalMap, $translate) {
    GlobalMap.switchRoute(false);

    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
        //alert($filter('translate')("RELOAD_APP"));
        localStorage.setItem('language', langKey);
        app.reloadApp();
    };
}]);

touristmapControllers.controller('NotFoundController', ['$scope', 'GlobalMap', function($scope, GlobalMap) {
    GlobalMap.switchRoute(false);
    $scope.pageName = '404';
    $scope.message = 'This page not found';
}]);