angular.module('starter.move-manager', [])

.controller('MoveManagerCtrl', function($window, $rootScope, $scope, $cordovaBluetoothSerial, $ionicModal, $timeout, $interval, $cordovaFile, $state, $ionicPopup, uuid4) {
  console.log('hello move manager!');
  console.log($rootScope.keyFrames.keyFrames.length);
  $scope.inputs = {
    fileName : ''
  }
  $scope.totalTime = '';
  $scope.totalTimeHeader = '';
  $scope.isPause = false;
  $scope.isLoop = false;
  // $rootScope.isBluetoothConnected = true;
  // $rootScope.isDeviceSlider = false;
  function activate(){
    console.log('activate');

    if($window.innerHeight < 1279 && $window.innerWidth < 799 ){
      $scope.isPhone = true;
    }

    $scope.totalTime = 0;
    angular.forEach($rootScope.keyFrames.keyFrames, function(data){
      $scope.totalTime += ( parseInt(data.duration) + parseInt(data.delay) );
      console.log($scope.totalTime);
      convertSecondsToTime();
    });


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


  function convertSecondsToTime(){
    var totalSec = $scope.totalTime;
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $scope.totalTimeHeader = result;
  }
  $scope.saveStack = function( fileName ) {
    if($rootScope.keyFrames.stackId !== '' && fileName === undefined){
      alert('overwrite!');
      document.addEventListener('deviceready', function () {
        alert('overwriting on ' + $rootScope.keyFrames.stackId);
        _.each($rootScope.moveStacks, function(moveStack){
          if(moveStack === $rootScope.keyFrames.stackId){
            $rootScope.moveStacks[_.indexOf($rootScope.moveStacks, moveStack)].keyFrames = $rootScope.keyFrames.keyFrames;
          }
        });
        // $rootScope.moveStacks[$rootScope.keyFrames.stackId].keyFrames = $rootScope.keyFrames.keyFrames;
        console.log($rootScope.moveStacks);
        $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
        .then(function (success) {
          alert('success!');
        }, function (error) {
          $scope.bluetoothRx = 'error';
        });
      });
    } else {
      document.addEventListener('deviceready', function () {
        var data = {
          stackId : uuid4.generate(),
          stackName : fileName,
          keyFrames : $rootScope.keyFrames.keyFrames
        }
        $rootScope.moveStacks.push(data);
        console.log($rootScope);
        $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
        .then(function (success) {
          alert('Created New Stack');
          $scope.bluetoothRx = 'file ' + data.stackName + ' saved!';
        }, function (error) {
          $scope.bluetoothRx = 'error';
        });
      });
    }

  }
  $scope.saveAsStack = function() {
    $scope.showPopup('saveAs');
  }

  $scope.showPopup = function( flag ) {
    $scope.data = {}

    // An elaborate, custom popup
    if($rootScope.keyFrames.stackId !== '' && flag !== 'saveAs'){
      $scope.saveStack();
    } else {
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.move">',
        title: 'Enter Stack Name',
        subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
      { text: 'Cancel' },
    {
      text: '<b>Save</b>',
      type: 'button-balanced',
      onTap: function(e) {
        if (!$scope.data.move) {
          //don't allow the user to close unless he enters wifi password
          e.preventDefault();
        } else {
          return $scope.data.move;
        }
      }
    }
    ]
  });
  myPopup.then(function(res) {
    console.log('Tapped!', res);
    if(res){
      $scope.saveStack(res);
    }

  });
}

};

$scope.loadStack = function() {
  $state.go('load-moves');
}

$scope.newStack = function() {
  if($rootScope.keyFrames.keyFrames.length){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Create New Stack',
      template: 'Are you sure you want to create new?<br><span style="font-style: italic; color: red;">*this will clear the whole move stack</span>'
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.keyFrames = {
          stackId : '',
          stackName : '',
          keyFrames : []
        };

      } else {

      }
    });
  }

}

$ionicModal.fromTemplateUrl('templates/moveManagerModal.html', {
  scope: $scope,
  animation: false
}).then(function(modal) {
  $scope.modal = modal;
});
$scope.openModal = function(data) {
  if(data){
    $scope.move = {};
    $scope.move.id = data.id;
    $scope.move.name = data.name;
    $scope.move.pan = data.pan;
    $scope.move.tilt = data.tilt;
    $scope.move.slider = data.slider;
    $scope.move.offset = data.offset;
    $scope.move.delay = parseInt(data.delay);
    $scope.move.duration = parseInt(data.duration);
  } else {
    $scope.move = {};
    var totalOffset = 0;

    var prevMove = $rootScope.keyFrames.keyFrames[$rootScope.keyFrames.keyFrames.length - 1];
    if(prevMove){
      totalOffset = parseInt(prevMove.duration) + parseInt(prevMove.delay) + parseInt(prevMove.offset);
      if(totalOffset !== 0){
        totalOffset += 1;
      }
    }

    $scope.move.name = 'Untitled Move';
    $scope.move.pan = $rootScope.currentControlPosition ? $rootScope.currentControlPosition.pan : 0;
    $scope.move.tilt = $rootScope.currentControlPosition ? $rootScope.currentControlPosition.tilt : 0;
    $scope.move.slider = $rootScope.currentControlPosition ? $rootScope.currentControlPosition.slider : 0;
    $scope.move.offset = totalOffset;
    $scope.move.delay = 0;
    $scope.move.duration = 0;
  }

  $scope.modal.show();
};
$scope.closeModal = function() {
  $scope.modal.hide();
};

$scope.testMove = function(move) {
  console.log(move);
  var loop = '0';

  if($scope.isLoop){
    loop = '1';
  } else {
    loop = '0';
  }

  var msg = 'G:[0,' + move.duration + ',' + move.delay + ',' + move.pan + ',' + move.tilt + ','
  + move.slider + ',' + loop + ']';
  console.log(msg);
  $scope.mainMsg(0, msg);
};

$scope.saveMove = function(id) {
  if(id !== undefined){
    $rootScope.keyFrames.keyFrames[id] = $scope.move;
    activate();
    console.log($scope.totalTime);
  } else {
    var id = '';
    if($rootScope.keyFrames.keyFrames !== undefined){
      id = $rootScope.keyFrames.keyFrames.length;
    } else {
      id = 0;
    }
    $scope.move.id =  id;
    activate();
    $rootScope.keyFrames.keyFrames.push($scope.move);
  }
  console.log($rootScope.keyFrames);
  $scope.modal.hide();
};

$scope.executeStack = function() {
  console.log('exectue stack!');
  var loop = '0';

  if($scope.isLoop){
    loop = '1';
  } else {
    loop = '0';
  }
  var initMsg = 'M:[' + $rootScope.keyFrames.keyFrames.length + ',' + loop + ']';
  console.log(initMsg);
  var mainMsg = '';
  var x = 0;
  // var tmp = [];
  $scope.initMsg(1, initMsg);

  var loop;
  $scope.isPause = true;
  loop = $interval(function(){
    console.log('transmitting');
    if(x < ($rootScope.keyFrames.keyFrames.length)){
      mainMsg = $rootScope.keyFrames.keyFrames[x].offset + ',' + $rootScope.keyFrames.keyFrames[x].duration + ',' + $rootScope.keyFrames.keyFrames[x].delay + ',' + $rootScope.keyFrames.keyFrames[x].pan
      + ',' + $rootScope.keyFrames.keyFrames[x].tilt+ ',' + $rootScope.keyFrames.keyFrames[x].slider + ']';
      console.log(mainMsg);
      $scope.mainMsg(1000, mainMsg);
    } else {
      $interval.cancel(loop);

    }
    x++;
  }, 450);
}

$scope.sendPause = function(){
  $scope.isPause = false;
  $scope.mainMsg(0, 'P');

}

$scope.sendStop = function(){
  $scope.isPause = false;
  $scope.mainMsg(0, 'D]');
}

$scope.enableLoop = function(){
  $scope.isLoop = true;
}

$scope.disableLoop = function(){
  $scope.isLoop = false;
}

$scope.initMsg = function(time, buffer){
  $timeout(function () {
    var data = stringToBytes(buffer);
    ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
      console.log('success on write!');
    }, function(){
      console.log('error on write!');
    });
  },time);
}

$scope.mainMsg = function(time, buffer){
  var data = stringToBytes(buffer);
  ble.write($rootScope.connectedDevice.id, "ffe0", "ffe1", data, function(){
    console.log('success on write!');
  }, function(){
    console.log('error on write!');
  });
}

$scope.checkBT = function (time) {
  $timeout(function () {
    $cordovaBluetoothSerial.isConnected().then(
      function() {
        $scope.blMsgStatus = 'Enabled';
        $scope.isBluetoothConnected = true;
      },
      function() {
        $scope.blMsgStatus = 'Disabled';
        $scope.isBluetoothConnected = false;
        $scope.connectBT($rootScope.bluetoothId);
      }
    );
  },time);
};
$scope.connectBT = function(id) {
  $cordovaBluetoothSerial.connect(id).then(
    function() {
      $rootScope.bluetoothId = id;
      $scope.blMsgStatus = 'Successfully Connected';
      $scope.isBluetoothConnected = true;
      $scope.subscribeBT();
    },
    function() {
      $scope.blMsgStatus = 'Error on Connection';
      $scope.isBluetoothConnected = false;
    }
  );
};

$scope.readBufferBT = function(buffer){
  var data = bytesToString(buffer);

  if(data !== ''){
    console.log('Received: ' + data);
  }

  if(data === 'E:0'){
    alert('Request Re-Transmission!');
  }

  if(data.charAt(0) === 'S' && data.charAt(1) === 'S'){
    var tmp1 = data.split(',');

    var slider1 = tmp1[0].split('S');
    slider1 = slider1[2];

    var isMoving1 = tmp1[1];
    if(isMoving1 === '6'){
      $scope.isMovingIndicator = true;
    } else if(isMoving === '0'){
      $scope.isPause = false;
    }else {
      $scope.isMovingIndicator = false;
    }

    if(slider1){
      $scope.bluetoothRx = 'Slider: ' + slider1;
      $scope.$apply();
    }
  } else {
    var tmp = data.split(',');

    var pan = tmp[0].split('P');
    pan = pan[2];
    var tilt = tmp[1];

    var slider = tmp[2];
    var isMoving = tmp[3];

    if(isMoving === '6'){
      $scope.isMovingIndicator = true;
    } else if(isMoving === '0'){
      $scope.isPause = false;
    }else {
      $scope.isMovingIndicator = false;
    }

    if(pan !== undefined && tilt !== undefined){
      $scope.currentPan = pan;
      $scope.currentTilt = tilt;
      $scope.bluetoothRx = 'Pan: ' + pan + ' - ' + 'Tilt: ' + tilt + ' - ' + 'Slider: ' + slider;
      $scope.$apply();
    }
  }
}

$scope.$on('$ionicView.beforeLeave', function (event) {
  ble.stopNotification($rootScope.connectedDevice.id, "ffe0", "ffe1", function(){
    console.log('Move Manager - notificaton stop');
  }, function(err){
    console.log(err);
  });
});

$scope.$on('$ionicView.enter', function (event) {
  ble.isEnabled(
    function() {
      $scope.blMsgStatus = 'Enabled';
      $scope.isBluetoothConnected = true;
      ble.startNotification($rootScope.connectedDevice.id, "ffe0", "ffe1", $scope.readBufferBT, function(err){
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

//$scope.checkBT(1000);
});
