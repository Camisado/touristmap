/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    reloadApp: function() {
        location.href = '#home';
        location.reload();
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        if (Platform.getPlatform()==="Mobile") {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } else {
            this.onDeviceReady();
        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        if(!Platform.isPC()) {
            connected = checkConnection();
            if (connected) {
                loadApp(app.receivedEvent);
            }
        } else {
            loadApp(app.receivedEvent)
        }

        function loadApp(deviceReadyFunc) {
            if(localStorage.getItem('language')) {
                GLOBAL_LANGUAGE = localStorage.getItem('language');
            } else {
                localStorage.setItem('language', 'en');
                GLOBAL_LANGUAGE = 'en';
            }

            loadMap(GLOBAL_LANGUAGE);

            function loadMap(langCode) {
                google.load('maps', '3.7', {
                    'other_params' : 'sensor=true&language=' + langCode,
                    'callback' : deviceReadyFunc
                });
            }
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
        angular.bootstrap( document, ['touristmapApp']);
    }
};

var GLOBAL_LANGUAGE;

var SERVER_URL = 'https://touristmapserver.herokuapp.com';

var Platform = {

    platform :null,

    getPlatform: function() {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            this.platform = "Mobile";
        } else {
            this.platform = "PC";
        }
        return this.platform;
    },

    isPC: function() {
        if(this.platform === "PC") {
            return true;
        } else {
            return false;
        }
    }
};

var connected;
function checkConnection() {
    var networkState = navigator.connection.type;
    var states = {};

    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.NONE] = 'No network connection';

    if((networkState === Connection.NONE) || (networkState === Connection.UNKNOWN)) {
        alert('Connection type: ' + states[networkState]);
        connected = false;
        document.addEventListener("online", onOnline, false);
        function onOnline() {
            alert("Connection resume!");
            document.addEventListener("offline", onOffline, false);
            function onOffline() {
                alert("Connection lost!");
            }
            app.reloadApp();
        }
    } else {
        connected = true;
        document.addEventListener("offline", onOffline, false);
        function onOffline() {
            alert("Connection lost!");
            document.addEventListener("online", onOnline, false);
            function onOnline() {
                alert("Connection resume!");
            }
        }
    }

    return connected;
}