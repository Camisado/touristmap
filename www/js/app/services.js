'use strict';

var touristmapServices = angular.module('touristmapServices', []);

touristmapServices.value('MyLocation', {
    lat: 0,
    lng: 0,
    marker: null
});

touristmapServices.value('NewPlaceLocation', {
    lat: 0,
    lng: 0
});

touristmapServices.factory('GlobalMap', ['MyLocation', 'MapControls', 'NewPlaceLocation', '$compile', '$filter', function(MyLocation, MapControls, NewPlaceLocation, $compile, $filter){

    var map;
    var mc;
    var marker;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var route;

    function getMap() {
        return map;
    }

    function getMC() {
        return mc;
    }

    function getMarker() {
        return marker;
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
        //navigator.splashscreen.show();
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

        google.maps.event.addListener(map, 'zoom_changed', function() {
            google.maps.event.trigger(map, 'resize');
            if(mc) {
                mc.repaint();
            }
        });
    }

    function showMarkers(list, scope) {
        var markers = [];

        for(var i = 0; i < list.length; i++) {
            var position = new google.maps.LatLng(
                list[i].location.lat,
                list[i].location.lng);
            var icon;
            switch (list[i].category) {
                case "1": {
                    icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                    break;
                }
                case "2": {
                    icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                    break;
                }
                case "3": {
                    icon = "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
                    break;
                }
            }
            var marker = new google.maps.Marker({
                position: position,
                icon: icon,
                map: map
            });
            markers.push(marker);

            scope.infowindow = new google.maps.InfoWindow({
                maxWidth: 350,
                maxHeight: 300
            });
            var contentString = '<div><infowindow></infowindow></div>';
            var compiled = $compile(contentString)(scope);


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

    return {
        getMap: getMap,
        getMC: getMC,
        marker: marker,
        isRoute: isRoute,
        setRoute: setRoute,
        switchRoute: switchRoute,
        initialize: initialize,
        showMarkers: showMarkers,
        calcRoute: calcRoute,
        closeRoute:closeRoute
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
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
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

touristmapServices.factory('Place', ['$http', 'NewPlaceLocation', 'UI', function($http, NewPlaceLocation, UI){

    var places = [];
    var update = false;

    function getPlaces() {
        return places;
    }

    function isUpdated() {
        return update;
    }

    function onPhotoDataSuccess(imageData) {
        var image = document.getElementById('imageFromPC');
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
        var image = document.getElementById('imageFromPC');
        var imageURI = image.src;
        UI.setStatusDiv("");

        if(file) {
            var fd = new FormData();
            fd.append("file", file); // Append the file


            var xhr = new XMLHttpRequest();
            xhr.open('POST', SERVER_URL + '/upload', true);

            xhr.upload.onprogress = function(e) {
                UI.uploadImageOnProgress(e);
            };

            xhr.onload = function() {
                if (this.status === 200) {
                    place.info.photo = this.response;
                    place.location = {};
                    place.location.lat = NewPlaceLocation.lat;
                    place.location.lng = NewPlaceLocation.lng;
                    UI.uploadImageSuccess(this);
                    callback(place);
                } else {
                    UI.uploadImageError(this.status);
                }
            };

            xhr.send(fd);
        } else {
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpeg,image/png";
            options.chunkedMode = false;

            var server = encodeURI(SERVER_URL + '/upload');

            // Transfer picture to server
            var ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {
                UI.uploadImageOnProgress(progressEvent);
            };
            ft.upload(imageURI, server, function(r) {
                place.info.photo = r.response;
                place.location = {};
                place.location.lat = NewPlaceLocation.lat;
                place.location.lng = NewPlaceLocation.lng;
                UI.uploadImageSuccess(r);
                callback(place);
            }, function(error) {
                UI.uploadImageError(error.code);
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
                UI.addPlaceError(status);
            });
    }

    function getList(callback, scope) {
        $http.get(SERVER_URL + '/list?collection=production')
            .success(function(data, status, headers, config) {
                places = data;
                update = true;
                callback(places, scope);
            }).
            error(function(data, status, headers, config) {
                alert('Error get list');
            });
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

touristmapServices.factory('UI', [function(){

    var setStatusDiv = function(status) {
        var statusDiv = document.getElementById('statusPhoto');
        statusDiv.innerHTML = status;
    };

    var uploadImageOnProgress = function(progressEvent) {
        var statusDiv = document.getElementById('statusPhoto');
        if (progressEvent.lengthComputable) {
            var percent = Math.ceil((progressEvent.loaded / progressEvent.total)*100);
            statusDiv.innerHTML = percent + "% / 100%";
            statusDiv.style.width = percent + "%";
        }
    };

    var uploadImageSuccess = function(response) {
        var statusDiv = document.getElementById('statusPhoto');
        var progress = document.getElementById('progress');
        console.log(response);
        statusDiv.innerHTML = "Upload successful: "+response.bytesSent+" bytes uploaded.";
        var addingPlace = document.getElementById('addingPlace');
        var spinner = document.getElementById('spinner');
        progress.className = progress.className + ' success';
        addingPlace.style.display = 'block';
        spinner.style.display = 'block';
    };

    var uploadImageError = function(errorCode) {
        var statusDiv = document.getElementById('statusPhoto');
        var progress = document.getElementById('progress');
        progress.className = progress.className + ' error';
        statusDiv.innerHTML = "Upload failed: Code = "+errorCode;
    };

    var addPlaceSuccess = function() {
        var statusPlace = document.getElementById('statusPlace');
        statusPlace.innerHTML = 'Add successful: Your place will be reviewed later.';
        var goBackButton = document.getElementById('goBackButton');
        var spinner = document.getElementById('spinner');
        statusPlace.className = statusPlace.className + ' success';
        statusPlace.style.display = 'block';
        spinner.style.display = 'none';
        goBackButton.style.display = 'block';
    };

    var addPlaceError = function(status) {
        var statusPlace = document.getElementById('statusPlace');
        statusPlace.className = statusPlace.className + ' error';
        statusPlace.style.display = 'block';
        statusPlace.innerHTML = "Add failed: Status = " + status;
    };

    return {
        setStatusDiv: setStatusDiv,
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
            GlobalMap.initialize(map, false, null, location);
        } else {
            GlobalMap.initialize(map, false);
        }
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