angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, $rootScope) {

  // Form data for the login modal

})

.controller('PlaylistsCtrl', function($rootScope, $scope, $state, $cordovaBluetoothSerial, $timeout, $ionicModal, $interval, $window) {
  $scope.size = 130;
  $scope.panProgress = 0.50;
  $scope.strokeWidth = 10;
  $scope.stroke = '#ef473a';
  $scope.background = '#444444';

  $scope.tiltProgress = 0.50;

  $scope.isLoop = false;
  $scope.isPantilt = false;
  $scope.isSlider = false;

  // $rootScope.isDeviceSlider = true;
  $scope.isBluetoothConnected = true;
  function activate(){
    if($window.innerHeight < 1279 && $window.innerWidth < 767 ){
      $scope.isPhone = true;
    } else {
      $scope.isPhone = false;
    }
  }

  function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  activate();
  $scope.enableLoop = function(){
    $scope.isLoop = true;
  }

  $scope.disableLoop = function(){
    $scope.isLoop = false;
  }

  $scope.settings = {
    speed : 50,
    panStart : -180,
    panEnd : 180,
    tiltStart : -180,
    tiltEnd : 180,
    slideStart : -495,
    slideEnd : 495,
    panHome : 0,
    tiltHome : 0,
    slideHome : 0,
    slaveMode : false,
    masterBoss: false,
    accelerationOffset : 100,
    distance: 2
  }

  $scope.pos = {
    x : 0.5,
    y : 0.5
  };

  $scope.currentPan = 1;
  $scope.currentTilt = 1;
  $scope.currentSlider = 1;

  var currentPanValue = 1;

  $scope.slider = 0;

  $scope.sliderPosition = {
    slider : 0
  }

  $scope.panTiltJoystickValue = {
    x : 0,
    y : 0
  };

  $scope.sliderJoystickValue = {
    x : 0,
    y : 0
  };

  $scope.duration = 5;

  $scope.done = function (value) {
    $scope.doneValue = value;

    if($scope.prevValue !== value.direction){
      $scope.prevValue = value.direction;
      if(value.offset === 12){
        if(value.direction === 'right'){
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,$scope.currentTilt,495);
        } else if(value.direction === 'left') {
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,$scope.currentTilt,-495);
        }
      } else {
        if(value.direction === 'up'){
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,179,$scope.currentSlider);
        } else if(value.direction === 'down') {
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,-179,$scope.currentSlider);
        } else if(value.direction === 'right'){
          $scope.goToXYZ(0,$scope.duration,0,179,$scope.currentTilt,$scope.currentSlider);
        } else if(value.direction === 'left') {
          $scope.goToXYZ(0,$scope.duration,0,-179,$scope.currentTilt,$scope.currentSlider);
        }
      }
    }

  };

  $scope.incDuration = function(){
    $scope.duration += 1;
  }
  $scope.decDuration = function(){
    $scope.duration -= 1;
  }

  $scope.incPan = function(){
    $scope.pos.x += 5;
  }
  $scope.decPan = function(){
    $scope.pos.x -= 5;
  }
  $scope.isSliderJoystick = false;
  $scope.isPanTiltJoystick = true;

  $scope.showSliderJoystick = function(){
    if($scope.isSliderJoystick === true){
      $scope.isSliderJoystick = false;
    } else {
      $scope.isSliderJoystick = true;
    }
  }

  $scope.showPanTiltJoystick = function(){
    if($scope.isPanTiltJoystick === true){
      $scope.isPanTiltJoystick = false;
    } else {
      $scope.isPanTiltJoystick = true;
    }
  }

  $scope.updateAllPosition = function(){
    var pan = Math.floor($scope.pos.x * 360);
    var tilt = Math.floor($scope.pos.y * 360);

    if(pan > 180){
      pan -= 360;
    }
    if(tilt > 180){
      tilt -= 360;
    }

    $scope.currentPan = pan;
    $scope.currentTilt = tilt;
    $scope.currentSlider = $scope.sliderPosition.slider;

    console.log($scope.currentPan);

    $scope.goToXYZ(0,$scope.duration,0,pan,tilt,$scope.sliderPosition.slider);
  }

  $scope.incSlider = function(){
    var tmp = parseInt($scope.sliderPosition.slider);
    $scope.sliderPosition.slider = tmp + 5;
  }

  $scope.fastIncSlider = function(){
    var tmp = parseInt($scope.sliderPosition.slider);
    $scope.sliderPosition.slider = tmp + 10;
  }

  $scope.decSlider = function(){
    $scope.sliderPosition.slider -= 5;
  }

  $scope.fastDecSlider = function(){
    $scope.sliderPosition.slider -= 10;
  }

  $scope.centerSlider = function(){
    $scope.sliderPosition.slider = 0;
  }

  $scope.addKeyFrame = function(){
    var pan = Math.floor($scope.pos.x * 360);
    var tilt = Math.floor($scope.pos.y * 360);

    if(pan > 180){
      pan -= 360;
    }
    if(tilt > 180){
      tilt -= 360;
    }

    var totalOffset = 0;

    var prevMove = $rootScope.keyFrames.keyFrames[$rootScope.keyFrames.keyFrames.length - 1];
    if(prevMove){
      totalOffset = parseInt(prevMove.duration) + parseInt(prevMove.delay) + parseInt(prevMove.offset);
      if(totalOffset !== 0){
        totalOffset += 1;
      }
    }

    var keyFrame = {
      id : $rootScope.keyFrames.keyFrames.length,
      name : 'move ' + $rootScope.keyFrames.keyFrames.length,
      slider : $scope.sliderPosition.slider,
      pan : pan,
      tilt : tilt,
      offset: totalOffset,
      delay: 0,
      duration: 0
    }

    $rootScope.keyFrames.keyFrames.push(keyFrame);
    alert('KeyFrame Added - Total: ' + $rootScope.keyFrames.keyFrames.length);
  }

  $scope.panTiltOnStart = function(id){
    $scope.isPantilt = true;
  }

  $scope.panTiltOnEnd = function(){
    console.log('release');
    console.log('position back to 0');
    $scope.writeBluetooth(1, 'D]');
    $scope.isPantilt = false;
  }

  $scope.sliderOnStart = function(id){
    $scope.isSlider = true;
  }

  $scope.sliderOnEnd = function(){
    console.log('release');
    console.log('position back to 0');
    $scope.writeBluetooth(1, 'D]');
    $scope.isSlider = false;
  }
  ///////////////////// Modal Settings ////////////

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    animation: false
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.saveModal = function() {
    $scope.sendSettings();
    $scope.modal.hide();
  };


  ///////// Bluetooth Functions ////////

  $scope.goToXYZ = function (offset, duration, delay, pan, tilt, slider) {
    var loop = false;

    if($scope.isLoop){
      loop = '1';
    } else {
      loop = '0';
    }

    var tmp = 'G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ',' + loop + ']';
    console.log(tmp);

    var data = stringToBytes(tmp);
    ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
      console.log('success on write!');
    }, function(){
      console.log('error on write!');
    });
  };

  $scope.openBTSettings = function() {
    $state.go('app.search');
  }

  $scope.sendSettings = function () {
    // $timeout(function () {

    var slaveMode = '';
    console.log($scope.settings.masterBoss);
    var masterBossOption = '1';
    if($scope.settings.masterBoss === 'pan-tilt'){
      masterBossOption = '1';
    } else if($scope.settings.masterBoss === 'slider'){
      masterBossOption = '1';
    } else if($scope.settings.masterBoss === 'both'){
      masterBossOption = '0';
    }

    if($scope.settings.slaveMode){
      slaveMode = '1';
    } else {
      slaveMode = '0';
    }
    var msg = 'S:[' + $scope.settings.panHome + ',' + $scope.settings.panStart + ',' + $scope.settings.panEnd + ',' + $scope.settings.tiltHome + ',' + $scope.settings.tiltStart + ',' + $scope.settings.tiltEnd + ',' + $scope.settings.slideHome + ',' + $scope.settings.slideStart + ',' + $scope.settings.slideEnd + ',' + slaveMode
    + ',' + $scope.settings.accelerationOffset + ',' + masterBossOption + ',' + $scope.settings.distance + ']';

    console.log(msg);

    var data = stringToBytes(msg);
    ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
      alert('Settings sent on Device');
    }, function(){
      alert('error on send!');
    });
    // },500);
  };

  $scope.goHome = function(time, data){
    console.log('home!');
    $scope.goToXYZ(0,$scope.duration,0,$scope.settings.panHome,$scope.settings.tiltHome,$scope.settings.slideHome);
  }

  $scope.writeBluetooth = function(time, tmp){
    var data = stringToBytes(tmp);
    ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
      console.log('success on write!');
    }, function(){
      console.log('error on write!');
    });
  }

  //////// Bluetooth Listener /////
  function readBufferBT ( buffer ){
    var data = bytesToString(buffer);

    if(data !== ''){
      console.log('Received: ' + data);
    }

    if(data === 'E:0'){
      alert('Request Re-Transmission!');
    }

    if($rootScope.isDeviceSlider){
      var tmp1 = data.split(',');
      var slider1 = tmp1[0].split('S');

      slider1 = slider1[2];

      if(slider1 !== undefined){

        $scope.currentSlider = slider1;

        $scope.bluetoothRx = 'Slider: ' + slider1;
      }
    } else {
      var tmp = data.split(',');
      var pan = tmp[0].split('P');

      pan = pan[2];
      var tilt = tmp[1];
      var slider = tmp[2];

      if(pan !== undefined && tilt !== undefined){
        $scope.currentPan = pan;
        $scope.currentTilt = tilt;
        $scope.currentSlider = slider;

        $scope.bluetoothRx = 'Pan: ' + pan + ' - ' + 'Tilt: ' + tilt + ' - ' + 'Slider: ' + slider;
      }
    }
  }

  $scope.$on('$ionicView.beforeLeave', function (event) {
    console.log('destroy! rawr');
    var pan = Math.floor($scope.pos.x * 360);
    var tilt = Math.floor($scope.pos.y * 360);

    if(pan > 180){
      pan -= 360;
    }
    if(tilt > 180){
      tilt -= 360;
    }

    $rootScope.currentControlPosition = {
      pan : pan,
      tilt : tilt,
      slider : $scope.sliderPosition.slider
    }

    ble.stopNotification($rootScope.connectedDevice.id, "ffe0", "ffe1", function(){
      console.log('Realtime Page - notificaton stop');
    }, function(err){
      console.log(err);
    });
  });

  $scope.$on('$ionicView.enter', function (event) {

    ble.isEnabled(
      function() {
        $scope.blMsgStatus = 'Enabled';
        $scope.isBluetoothConnected = true;
        ble.startNotification($rootScope.connectedDevice.id, "ffe0", "ffe1", readBufferBT, function(err){
          console.log(err);
        });
      },
      function() {
        $scope.blMsgStatus = 'Disabled';
        $scope.isBluetoothConnected = false;
        $scope.bluetoothRx = 'Bluetooth Currently Disabled';
        alert('isEnable - False');
      }
    );

  });

  //////////////// Bluetooth Initialization ////////////

  $scope.checkBT = function (time) {

  };

  //$scope.checkBT(1000);
  $scope.bluetoothRx = 'Reading Data From Bluetooth...';
})

.controller('TimeLapseCtrl', function($scope, $cordovaBluetoothSerial, $ionicModal, $timeout ) {
  console.log('Hello Time Lapse!');
  $scope.panStart = -90;
  $scope.panEnd = 90;

  $scope.tiltStart = 0;
  $scope.tiltEnd = 0;

  $scope.sliderStart = -490;
  $scope.sliderEnd = 490;

  $scope.duration = 60;
  $scope.shotsReq= 5;
  $scope.shutterDelay = 500;
  $scope.stabilizeDelay = 500;


  $scope.settings = {
    timeLapseVideoDuration : 60,
    frameRate : 30,
    takePicturesDuration : 60
  }

  function generateValues(){
    $scope.shotsReq = $scope.settings.timeLapseVideoDuration * $scope.settings.frameRate;
    $scope.duration = $scope.settings.takePicturesDuration * 60 * 60;
  }

  function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  $scope.activate = function(){
    console.log('activate');
    $ionicModal.fromTemplateUrl('templates/time-lapse-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }

  $scope.activate();

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.saveModal = function() {
    generateValues();
    $scope.modal.hide();
  };


  $scope.execute = function(){
    var msg = 't:[' + $scope.duration + ',' + $scope.shotsReq + ',' + $scope.panStart + ','
    + $scope.panEnd + ',' + $scope.tiltStart + ',' + $scope.tiltEnd + ',' + $scope.sliderStart + ','
    + $scope.sliderEnd + ',' + $scope.shutterDelay + ',' + $scope.stabilizeDelay + ']';

    console.log(msg);

    $scope.mainMsg(1, msg);
  }

  $scope.resetValues = function(){
    $scope.panStart = -90;
    $scope.panEnd = 90;

    $scope.tiltStart = 0;
    $scope.tiltEnd = 0;

    $scope.sliderStart = -490;
    $scope.sliderEnd = 490;

    $scope.duration = 60;
    $scope.shotsReq= 5;
    $scope.shutterDelay = 500;
    $scope.stabilizeDelay = 500;
  }

  $scope.mainMsg = function(time, buffer){

    var data = stringToBytes(buffer);
    ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
      alert('Executing Time Lapse.');
    }, function(){
      alert('error on write!');
    });
  }

  $scope.checkBT = function (time) {
    $timeout(function () {
      ble.isEnabled(
        function() {
          $scope.blMsgStatus = 'Enabled';
          $scope.isBluetoothConnected = true;
        },
        function() {
          $scope.blMsgStatus = 'Disabled';
          $scope.isBluetoothConnected = false;
          $scope.bluetoothRx = 'Bluetooth Currently Disabled';
        }
      );
    },time);
  };

  $scope.checkBT(500);

})

.controller('BluetoothSearch', function($state, $ionicHistory, $scope, $timeout, $rootScope, BLE, $interval) {
  $scope.blStatus = 'Bluetooth Disabled';
  $scope.isConnecting = false;
  $scope.btDevices = BLE.devices;

  var success = function () {
    if ($scope.btDevices.length < 1) {
      // a better solution would be to update a status message rather than an alert
      alert("Didn't find any Bluetooth Low Energy devices.");
    }
  };

  var failure = function (error) {
    alert(error);
  };

  function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  $scope.checkBT = function (time) {
    $timeout(function () {
      ble.isEnabled(
        function() {
          $scope.blStatus = 'Bluetooth Enable';
          BLE.scan().then(success, failure);
        },
        function() {
          ble.enable(
            function() {
              $scope.blStatus = 'Bluetooth Enable';
              BLE.scan().then(success, failure);
            },
            function() {
              console.log("The user did *not* enable Bluetooth");
            }
          );
        }
      );
    }, time);
  };

  $scope.listBT = function() {
    BLE.scan().then(
      success, failure
    ).finally(
      function() {
        $scope.$broadcast('scroll.refreshComplete');
      }
    )
  };

  $scope.connectBT = function(id, name) {
    BLE.connect(id).then(
      function(peripheral) {
        $rootScope.connectedDevice = peripheral;
        console.log($rootScope.connectedDevice);

        var data = stringToBytes('AT+PIO21');
        ble.write(peripheral.id, "ffe0", "ffe1", data, function(){
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go('app.playlists');
          alert('Successfully Connected');
        }, function(){
          alert('error on write!');
        });

      }
    );
  };

  $scope.testWrite = function(){
    var data = stringToBytes('hello');
    ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
      alert('success on write!');
    }, function(){
      alert('error on write!');
    });
  }

  $scope.checkBT(1000);
});
