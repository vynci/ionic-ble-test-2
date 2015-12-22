// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.move-stack-service', 'starter.bluetooth-service', 'starter.controllers', 'starter.cloud-storage', 'starter.load-moves', 'starter.move-manager', 'starter.joystick', 'angular.circular-slider', 'angular-progress-arc', 'uuid4'])

.run(function($ionicPlatform, $cordovaBluetoothSerial, $window, $rootScope, $cordovaFile) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
        .then(function(result) {
        });
      }
    }

    document.addEventListener('deviceready', function () {
      $cordovaFile.checkFile(cordova.file.dataDirectory, 'autoCraneFile20.json')
      .then(function (success) {
        document.addEventListener('deviceready', function () {
          $cordovaFile.readAsText(cordova.file.dataDirectory, 'autoCraneFile20.json')
          .then(function (success) {
            var tmp = JSON.parse(success);
            $rootScope.moveStacks = tmp;
          }, function (error) {
            alert('file error!');
          });
        });
      }, function (error) {
        $rootScope.moveStacks = [];
        document.addEventListener('deviceready', function () {
          $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
           .then(function (success) {
           }, function (error) {

          });
        });
      });
    });

    $rootScope.keyFrames = {
      stackId : '',
      stackName : '',
      keyFrames : []
    };
    $rootScope.user = {};
    Parse.initialize("AHkrgtmlTdQTmr03xh8qF13P5qtxVbZz8VZt70uh", "03VbiUY8LtGBvyoniz8ZbqMmYeSBf4Jspk6rsrac");
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'BluetoothSearch'
      }
    }
  })

  .state('app.timeLapse', {
    url: '/time-lapse',
    views: {
      'menuContent': {
        templateUrl: 'templates/time-lapse.html',
        controller: 'TimeLapseCtrl'
      }
    }
  })

  .state('app.moveManager', {
      url: '/move-manager',
      views: {
        'menuContent': {
          templateUrl: 'templates/move-manager.html',
          controller: 'MoveManagerCtrl'
        }
      }
    })

  .state('app.loadMoves', {
      url: '/load-moves',
      views: {
        'menuContent': {
          templateUrl: 'templates/load-moves.html',
          controller: 'LoadMovesCtrl'
        }
      }
    })

  .state('app.playlists', {
    url: '/playlists',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  })

  .state('app.cloudStorage', {
    url: '/cloud-storage',
    views: {
      'menuContent': {
        templateUrl: 'templates/cloud-storage.html',
        controller: 'CloudStorageCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/search');
});
