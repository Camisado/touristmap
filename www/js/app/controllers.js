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

touristmapControllers.controller('ListController', ['$scope', 'Place', 'GlobalMap', function($scope, Place, GlobalMap) {
    $(document).foundation({
        reveal : {
            close_on_background_click: false,
            animation: null
        }
    });
    GlobalMap.switchRoute(false);
    $scope.list = Place.getPlaces();
    $scope.selectItems = ["All data", "Title", "Short description", "Category"];
    $scope.search = {
        $: '',
        info: {
            title: '',
            description: {
                short: '',
                long: ''
            }
        },
        category: ''
    };

    $scope.changeFilter = function() {
        $scope.value = '';
        $scope.search.$ = '';
        $scope.search.info.title = '';
        $scope.search.info.description.short = '';
        $scope.search.category = '';
        switch ($scope.selectedFilter) {
            case "All data": {
                $scope.orderParam = 'info.title';
                break;
            }
            case "Title": {
                $scope.orderParam = 'info.title';
                break;
            }
            case "Short description": {
                $scope.orderParam = 'info.description.short';
                break;
            }
            case "Category": {
                $scope.orderParam = 'category';
                break;
            }
        }
    };

    $scope.changeQuery = function () {
        switch ($scope.selectedFilter) {
            case "All data": {
                $scope.search.$ = $scope.value;
                break;
            }
            case "Title": {
                $scope.search.info = {
                    title: $scope.value,
                    description : {
                        short: ''
                    }
                };
                break;
            }
            case "Short description": {
                $scope.search.info = {
                    title: '',
                    description : {
                        short: $scope.value
                    }
                };
                break;
            }
            case "Category": {
                $scope.search.category = $scope.value;
                break;
            }
        }
    };

    $scope.initSelect = function () {
        $scope.orderParam = 'info.title';
        return 'Title';
    };

    $scope.toModalDetails = function(place) {
        $scope.placeDetails = place;
    };

    $scope.goToMap = function(location) {
        window.location = "#home/" + location.lat + "/" + location.lng;
    }
}]);

touristmapControllers.controller('AddPlaceController', ['$scope', 'GlobalMap', 'Place',  function($scope, GlobalMap, Place) {
    $(document).foundation({
        reveal : {
            close_on_background_click: false,
            animation: null
        }
    });
    GlobalMap.switchRoute(false);
    var local_map = document.getElementById("add_map_canvas");
    if(local_map) {
        GlobalMap.initialize(local_map, true);
    }

    function addPlaceWrap() {
        Place.uploadPhoto($scope.place, Place.addPlace, $scope.file);
    }

    function goBack() {
        $(document).foundation('reveal', 'close');
    }

    $scope.isPC = function() {
        return Platform.isPC();
    };

    $scope.isPlacedMarker = function() {
        return GlobalMap.isPlacedMarker();
    };

    function onFileSelected(event) {
        var selectedFile = event.target.files[0];
        var reader = new FileReader();

        var imgtag = document.getElementById("image");
        $scope.file = selectedFile;

        reader.onload = function(event) {
            imgtag.src = event.target.result;
        };

        reader.readAsDataURL(selectedFile);
    }

    if(Platform.isPC()) {
        var uploadInput = document.getElementById("uploadInput");
        uploadInput.onchange = onFileSelected;
    } else {
        var capturePhoto = document.getElementById('capturePhoto');
        var openPhoto = document.getElementById('openPhoto');
        capturePhoto.addEventListener('click', Place.capturePhoto, false);
        openPhoto.addEventListener('click', Place.openPhoto, false);
    }
    var addPlace = document.getElementById('addPlace');
    var goBackButton = document.getElementById('goBackButton');
    addPlace.addEventListener('click', addPlaceWrap, false);
    goBackButton.addEventListener('click', goBack, false);
}]);

touristmapControllers.controller('SettingsController', ['$scope', 'GlobalMap', '$translate', function($scope, GlobalMap, $translate) {
    GlobalMap.switchRoute(false);
    $scope.pageName = 'Settings';
    $scope.message = 'Contact us! JK. This is just a demo.';

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