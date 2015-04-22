'use strict';

var touristmapServices = angular.module('touristmapServices', []);

touristmapServices.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    /**
     * Just setting useXDomain to true is not enough. AJAX request are also
     * send with the X-Requested-With header, which indicate them as being
     * AJAX. Removing the header is necessary, so the server is not
     * rejecting the incoming request.
     **/
    //$httpProvider.defaults.headers.common['Access-Control-Request-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

touristmapServices.value('MyLocation', {
    lat: 0,
    lng: 0,
    marker: null
});

touristmapServices.value('NewPlaceLocation', {
    lat: 0,
    lng: 0
});

touristmapServices.factory('GlobalMap', ['GoogleMap', 'YandexMap', function(GoogleMap, YandexMap){

    var currentMap;
    var canWalk;

    if (GLOBAL_MAP==='google') {
        console.log('google');
        currentMap = GoogleMap;
        canWalk = true;
    }
    if (GLOBAL_MAP==='yandex') {
        console.log('yandex');
        currentMap = YandexMap;
        canWalk = false;
    }

    function isCanWalk() {
        return canWalk;
    }

    function isRoute() {
        return currentMap.isRoute();
    }

    function setRoute(new_route) {
        currentMap.setRoute(new_route);
    }

    function switchRoute(route) {
        currentMap.switchRoute(route);
    }

    function initialize(id, isDropable, scope, placeLocation) {
        console.log("init");
        currentMap.initialize(id, isDropable, scope, placeLocation);
    }

    function showMarkers(list, scope) {
        console.log("show");
        currentMap.showMarkers(list, scope);
    }

    function calcRoute(start, end, type) {
        console.log('global route');
        currentMap.calcRoute(start, end, type);
    }

    function closeRoute() {
        $('.off-canvas-wrap').removeClass('offcanvas-overlap-left');
        currentMap.closeRoute();
        setRoute(false);
    }

    function closeInfowindow(scope) {
        currentMap.closeInfowindow(scope);
    }

    return {
        isCanWalk: isCanWalk,
        isRoute: isRoute,
        setRoute: setRoute,
        switchRoute: switchRoute,
        initialize: initialize,
        showMarkers: showMarkers,
        calcRoute: calcRoute,
        closeRoute:closeRoute,
        closeInfowindow: closeInfowindow
    };
}]);

touristmapServices.factory('GoogleMap', ['MyLocation', 'MapControls', 'NewPlaceLocation', '$compile', '$filter', function(MyLocation, MapControls, NewPlaceLocation, $compile, $filter){

    var map;
    var mc;
    var marker;
    var route;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    function getMap() {
        return map;
    }

    function getMC() {
        return mc;
    }

    function isRoute() {
        return route;
    }

    function setRoute(new_route) {
        route = new_route;
        switchRoute(new_route);
    }

    function switchRoute(route) {
        var route_panel = document.getElementById('route_panel');
        if(route) {
            route_panel.className = '';
        } else {
            route_panel.className = 'hide';
        }
    }

    function initialize(id, isDropable, scope, placeLocation) {
        map = null;
        var mapOptions = {
            center: new google.maps.LatLng(MyLocation.lat, MyLocation.lng),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            panControl: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false
        };

        map = new google.maps.Map(id, mapOptions);
        var homeControlDiv = document.createElement('div');
        var myLocationControl = new MapControls.myLocationControl(homeControlDiv, map);
        homeControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);

        if(placeLocation) {
            goToPlace(placeLocation);
        } else {
            myLocationControl.getMyPosition();
        }

        if(isDropable) {
            scope.placed = false;
            marker = null;
            google.maps.event.addListener(map, 'click', function (event) {
                placeMarker(event.latLng);
            });
        } else {
            directionsDisplay.setMap(map);
            directionsDisplay.setPanel(document.getElementById('directions-panel'));
        }

        google.maps.event.addListener(map, 'zoom_changed', function() {
            google.maps.event.trigger(map, 'resize');
            if(mc) {
                mc.repaint();
            }
        });

        function placeMarker(location) {
            if (marker) {
                //marker.setPosition(location);
                alert($filter('translate')("DROP_MARKER"));
            } else {
                marker = new google.maps.Marker({
                    position: location,
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    map: map
                });
                NewPlaceLocation.lat = location.lat();
                NewPlaceLocation.lng = location.lng();
                scope.placed = true;
                scope.$apply();
                google.maps.event.addListener(marker, "dragend", function (event) {
                    NewPlaceLocation.lat = event.latLng.lat();
                    NewPlaceLocation.lng = event.latLng.lng();
                });
            }
        }

        function goToPlace(location) {
            var pos = new google.maps.LatLng(location.lat,
                location.lng);
            map.panTo(pos);
            map.setZoom(17);
        }
    }

    function showMarkers(list, scope) {
        var markers = [];

        var contentString = '<div><infowindow></infowindow></div>';
        var compiled = $compile(contentString)(scope);

        scope.infowindow = new google.maps.InfoWindow({
            maxWidth: 500,
            maxHeight: 500
        });

        for(var i = 0; i < list.length; i++) {
            var position = new google.maps.LatLng(
                list[i].location.lat,
                list[i].location.lng);
            var icon;
            switch (list[i].category) {
                case "1": {
                    icon = "img/icons/markers/1.png";
                    break;
                }
                case "2": {
                    icon = "img/icons/markers/2.png";
                    break;
                }
                case "3": {
                    icon = "img/icons/markers/3.png";
                    break;
                }
                case "4": {
                    icon = "img/icons/markers/4.png";
                    break;
                }
                case "5": {
                    icon = "img/icons/markers/5.png";
                    break;
                }
                case "6": {
                    icon = "img/icons/markers/6.png";
                    break;
                }
                case "7": {
                    icon = "img/icons/markers/7.png";
                    break;
                }
                case "8": {
                    icon = "img/icons/markers/8.png";
                    break;
                }
            }
            var pinIcon = new google.maps.MarkerImage(
                icon,
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(30, 45)
            );
            var marker = new google.maps.Marker({
                position: position,
                icon: pinIcon,
                map: map
            });
            markers.push(marker);

            google.maps.event.addListener(marker, 'click', (function (marker, scope, place) {
                return function () {
                    scope.place = place;
                    scope.$apply();
                    scope.infowindow.setContent(compiled[0]);
                    scope.infowindow.open(map, marker);
                };
            })(marker, scope, list[i]));

            google.maps.event.addListener(scope.infowindow, 'domready', function () {
                var details = document.getElementById('details');
                $(document).foundation({
                    reveal: {
                        close_on_background_click: false,
                        animation: null
                    }
                });
            });
        }
        var mcOptions = {maxZoom: 16};
        mc = new MarkerClusterer(map, markers, mcOptions);
        google.maps.event.trigger(map, 'resize');
        if(!Platform.isPC()) {
            spinnerplugin.hide();
        }
    }

    function calcRoute(start, end, type) {
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));
        var request = {
            origin:start.lat + ',' + start.lng,
            destination:end.lat + ',' + end.lng,
            travelMode: google.maps.TravelMode[type]
        };
        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                //document.getElementById('directions-panel').innerHTML = '';
                directionsDisplay.setDirections(response);
                google.maps.event.trigger(map, 'resize');
                setRoute(true);
            } else {
                setRoute(false);
            }
        });
    }

    function closeRoute() {
        directionsDisplay.setMap(null);
        directionsDisplay.setPanel(null);
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();
    }

    function closeInfowindow(scope) {
        scope.infowindow.close();
    }

    return {
        getMap: getMap,
        getMC: getMC,
        isRoute: isRoute,
        setRoute: setRoute,
        switchRoute: switchRoute,
        initialize: initialize,
        showMarkers: showMarkers,
        calcRoute: calcRoute,
        closeRoute:closeRoute,
        closeInfowindow: closeInfowindow
    };
}]);

touristmapServices.factory('YandexMap', ['MyLocation', 'MapControls', 'NewPlaceLocation', '$compile', '$filter', function(MyLocation, MapControls, NewPlaceLocation, $compile, $filter){

    var map;
    var marker;
    var route;

    function getMap() {
        return map;
    }

    function isRoute() {
        return route;
    }

    function setRoute(new_route) {
        route = new_route;
        switchRoute(new_route);
    }

    function switchRoute(route) {
        var route_panel = document.getElementById('route_panel');
        if(route) {
            route_panel.className = '';
        } else {
            route_panel.className = 'hide';
        }
    }

    function initialize(id, isDropable, scope, placeLocation) {
        map = null;

        if(placeLocation) {
            map = new ymaps.Map(id, {
                center: [placeLocation.lat, placeLocation.lng],
                zoom: 17,
                controls: []
            });

            map.controls.add('geolocationControl', {float: 'none', position: {bottom: 30, right: 10}});
            map.controls.add('rulerControl', {float: 'none', position: {bottom: 30, left: 10}});
            map.controls.add(new ymaps.control.TypeSelector(['yandex#map', 'yandex#hybrid']), {float: 'right'});
            if(route) {
                $('.off-canvas-wrap').removeClass('offcanvas-overlap-left');
                closeRoute();
                setRoute(false);
            }
        } else {
            map = new ymaps.Map(id, {
                center: [MyLocation.lat, MyLocation.lng],
                zoom: 15,
                controls: []
            });

            map.controls.add('geolocationControl', {float: 'none', position: {bottom: 30, right: 10}});
            map.controls.add('rulerControl', {float: 'none', position: {bottom: 30, left: 10}});
            map.controls.add(new ymaps.control.TypeSelector(['yandex#map', 'yandex#hybrid']), {float: 'right'});

            ymaps.geolocation.get({
                mapStateAutoApply: true
            }).then(function (result) {
                MyLocation.lat = result.geoObjects.position[0];
                MyLocation.lng = result.geoObjects.position[1];
                map.geoObjects.add(result.geoObjects);
                map.setCenter([MyLocation.lat, MyLocation.lng], 15, {
                    checkZoomRange: true
                });

                if(route) {
                    map.geoObjects.add(route);
                }
            });
        }

        if(isDropable) {
            scope.placed = false;
            marker = null;

            map.events.add('click', function (e) {
                placeMarker(e.get('coords'));
            });
        } else {

        }

        function placeMarker(location) {
            if (marker) {
                alert($filter('translate')("DROP_MARKER"));
            } else {
                marker = new ymaps.Placemark([location[0], location[1]],{},{draggable: true});
                map.geoObjects.add(marker);
                NewPlaceLocation.lat = location[0];
                NewPlaceLocation.lng = location[1];
                scope.placed = true;
                scope.$apply();

                marker.events.add("dragend", function (e) {
                    var coordinates = this.geometry.getCoordinates();
                    NewPlaceLocation.lat = coordinates[0];
                    NewPlaceLocation.lng = coordinates[1];
                }, marker);
            }
        }
    }

    function showMarkers(list, scope) {
        var markers = [];

        var contentString = '<div><infowindow></infowindow></div>';
        var compiled = $compile(contentString)(scope);

        var MyContentLayout = ymaps.templateLayoutFactory.createClass('', {
            build: function () {
                MyContentLayout.superclass.build.call(this);
                this.getParentElement().appendChild(compiled[0]);
            }
        });

        for(var i = 0; i < list.length; i++) {
            var icon;
            switch (list[i].category) {
                case "1": {
                    icon = "img/icons/markers/1.png";
                    break;
                }
                case "2": {
                    icon = "img/icons/markers/2.png";
                    break;
                }
                case "3": {
                    icon = "img/icons/markers/3.png";
                    break;
                }
                case "4": {
                    icon = "img/icons/markers/4.png";
                    break;
                }
                case "5": {
                    icon = "img/icons/markers/5.png";
                    break;
                }
                case "6": {
                    icon = "img/icons/markers/6.png";
                    break;
                }
                case "7": {
                    icon = "img/icons/markers/7.png";
                    break;
                }
                case "8": {
                    icon = "img/icons/markers/8.png";
                    break;
                }
            }

            var placemark = new ymaps.Placemark([list[i].location.lat, list[i].location.lng], {}, {
                iconLayout: 'default#image',
                iconImageHref: icon,
                iconImageSize: [30, 45]
            });

            placemark.options.set('balloonContentLayout', MyContentLayout);

            placemark.events.add("click", (function(place, scope, marker) {
                return function() {
                    scope.place = place;
                    scope.balloon = marker.balloon;
                    scope.$apply();
                    scope.balloon.open();
                };
            })(list[i], scope, placemark));

            placemark.events.add("balloonopen", function (event) {
                $(document).foundation({
                    reveal: {
                        close_on_background_click: false,
                        animation: null
                    }
                });
            });

            markers.push(placemark);
        }

        var clusterer = new ymaps.Clusterer();
        clusterer.add(markers);
        map.geoObjects.add(clusterer);

        if(!Platform.isPC()) {
            spinnerplugin.hide();
        }
    }

    function calcRoute(start, end, type) {
        console.log('yandex route');
        ymaps.route([[start.lat, start.lng], [end.lat, end.lng]], {
            mapStateAutoApply: true
        }).then(
            function (router) {
                route && map.geoObjects.remove(route);
                route = router;
                map.geoObjects.add(route);

                var way = route.getPaths().get(0);
                var segments = way.getSegments();
                var moveList = '';

                for (var i = 0; i < segments.length; i++) {
                    var street = segments[i].getStreet();
                    moveList += "<div class='segment-panel'>";
                    moveList += "<h5>" + segments[i].getHumanAction().toLocaleUpperCase() + "</h5>";
                    moveList += segments[i].getHumanLength() + ", " + street;
                    moveList += "</div>"
                }

                var panel = document.getElementById('directions-panel');
                panel.innerHTML = moveList;
            },
            function (error) {
                alert('Возникла ошибка: ' + error.message);
            }
        );
    }

    function closeRoute() {
        map.geoObjects.remove(route);
        route = null;
    }

    function closeInfowindow(scope) {
        scope.balloon.close();
    }

    return {
        getMap: getMap,
        isRoute: isRoute,
        setRoute: setRoute,
        switchRoute: switchRoute,
        initialize: initialize,
        showMarkers: showMarkers,
        calcRoute: calcRoute,
        closeRoute:closeRoute,
        closeInfowindow: closeInfowindow
    };
}]);

touristmapServices.factory('MapControls', ['MyLocation', function(MyLocation){
    function myLocationControl(controlDiv, map) {
        controlDiv.style.margin = "5px";
        controlDiv.style.padding = "5px";

        var controlUI = document.createElement("div");
        controlUI.className = "mylocation-button";
        controlUI.title = "Move to my location";
        controlDiv.appendChild(controlUI);

        var controlImage = document.createElement("img");
        controlImage.className = "mylocation-button-img";
        controlImage.src = "img/icons/location.png";
        controlUI.appendChild(controlImage);

        function getMyPosition() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successPosition, errorPosition);
            } else {
                alert("Geolocation not supported!");
            }

            function successPosition(position) {
                MyLocation.lat = position.coords.latitude;
                MyLocation.lng = position.coords.longitude;
                var myPos = new google.maps.LatLng(MyLocation.lat,
                    MyLocation.lng);

                var marker = new google.maps.Marker({
                    position: myPos,
                    title: "I'm here!",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    zIndex: 99999
                });
                if(MyLocation.marker === null) {
                    marker.setMap(map);
                    MyLocation.marker = marker;
                } else {
                    MyLocation.marker.setMap(null);
                    marker.setMap(map);
                    MyLocation.marker = marker;
                }

                map.panTo(myPos);
                map.setZoom(15);
            }

            function errorPosition(msg) {
                alert("Fail get position: " + msg);
            }
        }

        google.maps.event.addDomListener(controlUI, 'click', function() {
            getMyPosition(map);
        });

        google.maps.event.addListener(map, 'center_changed', function() {
            var mapCenter = map.getCenter();
            var myLoc = new google.maps.LatLng(MyLocation.lat, MyLocation.lng);
            if(mapCenter.equals(myLoc)) {
                controlImage.src = "img/icons/location-centered.png";
            } else {
                controlImage.src = "img/icons/location.png";
            }
        });

        return {
            getMyPosition: getMyPosition
        };
    }

    return {
        myLocationControl: myLocationControl
    };
}]);

touristmapServices.factory('Place', ['$http', 'NewPlaceLocation', 'UI', '$filter', function($http, NewPlaceLocation, UI, $filter){

    var places = [];
    var update = false;

    function getPlaces() {
        return places;
    }

    function isUpdated() {
        return update;
    }

    function onPhotoDataSuccess(imageData) {
        var image = document.getElementById('image');
        image.src = imageData;
    }

    function capturePhoto(scope) {
        scope.photo = true;
        scope.$apply();
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
            quality: 50,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            saveToPhotoAlbum: true,
            correctOrientation: true
        });
    }

    function openPhoto(scope) {
        scope.photo = true;
        scope.$apply();
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
            destinationType: window.Camera.DestinationType.FILE_URI,
            sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: window.Camera.MediaType.PICTURE
        });
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

    function uploadPhoto (place, callback, file) {
        if(file) {
            var fd = new FormData();
            fd.append("file", file); // Append the file


            var xhr = new XMLHttpRequest();
            xhr.open('POST', SERVER_URL + '/upload', true);

            xhr.upload.onprogress = function(e) {
                UI.uploadImageOnProgress();
            };

            xhr.onload = function() {
                if (this.status === 200) {
                    place.info.photo = this.response;
                    place.location = {};
                    place.location.lat = NewPlaceLocation.lat;
                    place.location.lng = NewPlaceLocation.lng;
                    UI.uploadImageSuccess();
                    callback(place);
                } else {
                    UI.uploadImageError();
                }
            };

            xhr.send(fd);
        } else {
            var image = document.getElementById('image');
            var imageURI = image.src;
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpeg,image/png";
            options.chunkedMode = false;

            var server = encodeURI(SERVER_URL + '/upload');

            // Transfer picture to server
            var ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {
                UI.uploadImageOnProgress();
            };
            ft.upload(imageURI, server, function(r) {
                place.info.photo = r.response;
                place.location = {};
                place.location.lat = NewPlaceLocation.lat;
                place.location.lng = NewPlaceLocation.lng;
                UI.uploadImageSuccess();
                callback(place);
            }, function(error) {
                UI.uploadImageError();
            }, options, true);
        }
    }

    function addPlace(place) {
        $http.post(SERVER_URL + '/add?collection=production', place)
            .success(function(data, status, headers, config) {
                update = false;
                UI.addPlaceSuccess();
            }).
            error(function(data, status, headers, config) {
                UI.addPlaceError();
            });
    }

    function getList(callback, scope) {
        $http.get(SERVER_URL + '/list?collection=production')
            .success(function(data, status, headers, config) {
                places = data;
                toCategorySearch(places);
                update = true;
                callback(places, scope);
            }).
            error(function(data, status, headers, config) {
                alert('Error get list');
            });
    }

    function toCategorySearch(list) {
        for(var i = 0; i < list.length; i++) {
            list[i].categoryFilter = $filter('category')(list[i].category);
        }
    }

    return {
        getPlaces: getPlaces,
        isUpdated: isUpdated,
        capturePhoto: capturePhoto,
        openPhoto: openPhoto,
        uploadPhoto: uploadPhoto,
        addPlace: addPlace,
        getList: getList
    };
}]);

touristmapServices.factory('UI', ['$filter', function($filter){

    function toProgress(element) {
        element.className = element.className.replace( /(?:^|\s)info(?!\S)/g , 'warning' );
        element.innerHTML = $filter('translate')("STATUS_IN_PROGRESS");
    }

    function toSuccess(element) {
        element.className = element.className.replace( /(?:^|\s)warning(?!\S)/g , 'success' );
        element.innerHTML = $filter('translate')("STATUS_SUCCESS");
    }

    function toError(element) {
        element.className = element.className.replace( /(?:^|\s)warning(?!\S)/g , 'alert' );
        element.innerHTML = $filter('translate')("STATUS_ERROR");
    }

    function toReject(element) {
        element.className = element.className.replace( /(?:^|\s)info(?!\S)/g , 'secondary' );
        element.innerHTML = $filter('translate')("STATUS_REJECT");
    }

    function hide(element) {
        element.className += " hide";
    }

    function show(element) {
        element.className = element.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
    }

    function uploadImageOnProgress() {
        toProgress(document.getElementById('photoStatus'));
    }

    function uploadImageSuccess() {
        toSuccess(document.getElementById('photoStatus'));
        toProgress(document.getElementById('placeStatus'));
    }

    function uploadImageError() {
        toError(document.getElementById('photoStatus'));
        toReject(document.getElementById('placeStatus'));
    }

    function addPlaceSuccess() {
        toSuccess(document.getElementById('placeStatus'));
        hide(document.getElementById('spinner'));
        show(document.getElementById('goBackButton'));
    }

    function addPlaceError() {
        toError(document.getElementById('placeStatus'));
        hide(document.getElementById('spinner'));
        show(document.getElementById('goBackButton'));
    }

    return {
        uploadImageOnProgress: uploadImageOnProgress,
        uploadImageSuccess: uploadImageSuccess,
        uploadImageError: uploadImageError,
        addPlaceSuccess: addPlaceSuccess,
        addPlaceError: addPlaceError
    }
}]);

touristmapServices.factory('Starter', ['GlobalMap', 'Place', function(GlobalMap, Place){

    function start(scope, routeParams) {
        var map = document.getElementById("map_canvas");
        if(routeParams.lat && routeParams.lng) {
            var location = {
                lat: routeParams.lat,
                lng: routeParams.lng
            };
            //GlobalMap.initialize(map, false, null, location);
        }
        GlobalMap.initialize(map, false, null, location);
        //else {
        //    GlobalMap.initialize(map, false);
        //}
        if (GlobalMap.isRoute()) {
            GlobalMap.switchRoute(true);
        }
        if (!Place.isUpdated()) {
            Place.getList(GlobalMap.showMarkers, scope);
        } else {
            GlobalMap.showMarkers(Place.getPlaces(), scope);
        }
    }

    return {
        start: start
    }
}]);

touristmapServices.factory('Category', ['$filter', function($filter){

    var categories = [
        ["1", $filter('translate')("RELIGIOUS")],
        ["2", $filter('translate')("ARCHITECTURE")],
        ["3", $filter('translate')("SQUARES_STREETS_BRIDGER")],
        ["4", $filter('translate')("MUSEUMS")],
        ["5", $filter('translate')("MONUMENTS")],
        ["6", $filter('translate')("PARKS")],
        ["7", $filter('translate')("RIVERS")],
        ["8", $filter('translate')("FOUNTAINS")]
    ];

    function getCategory(key) {
        var category;
        for (var i = 0; i < categories.length; i++) {
            if (categories[i][0]===key) {
                category = categories[i][1];
            }
        }
        return category;
    }

    return {
        getCategory: getCategory,
        list: categories
    }
}]);