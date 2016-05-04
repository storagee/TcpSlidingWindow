var myApp = angular.module('myApp', []);

myApp.controller('Controller', function ($scope) {

    //$scope.accumulateTime = 5000;
    $scope.distance = 300;
    $scope.count = 20;
    $scope.speed = 250;
    $scope.td = 200;//发送延时
    $scope.defaultWindowSize = 5;
    $scope.sender = $('.sender');
    $scope.receiver = $('.receiving-container');
    $scope.confirm = $('.confirm-container');
    $scope.sendingWindowSize = $scope.defaultWindowSize;
    $scope.receivingWindowSize = $scope.defaultWindowSize;
    $scope.rto = 10;
    $scope.rtt = $scope.distance / $scope.speed;
    $scope.lostRate = 0;
    $scope.reset = function () {
        location.reload();
    };
    $scope.is20sended = false;//fix bug

    var receivingPlaces = [];
    var sendingDatums = [];
    for (var i = 0; i < $scope.count; i++) {
        var receivingPlace = new Datum(i + 1 + $scope.count, $scope);
        receivingPlaces.push(receivingPlace);
    }
    $scope.receivingPlaces = receivingPlaces;
    $scope.$watch('lostRate', function () {
        var lostCount = Math.floor($scope.count * $scope.lostRate);
        var lost = 0;
        var tempArray = Array($scope.count).fill('temp').map(function (v, i) {
            return i;
        });
        for (var i = 0; i < tempArray.length; i++) {
            var temp = tempArray[i];
            var random0to20 = Math.floor(Math.random() * 20);
            tempArray[i] = tempArray[random0to20];
            tempArray[random0to20] = temp;
        }
        sendingDatums = [];
        for (var i = 0; i < $scope.count; i++) {
            var sendingDatum = new Datum(i + 1, $scope);
            sendingDatums.push(sendingDatum);
        }
        for (var i = 0; i < lostCount; i++) {
            sendingDatums[tempArray[i]].lostState = Math.random() > 0.5 ? 2 : 2;
        }
        //var tempCount = 0;
        //for(var i=0; i<sendingDatums.length; i++){
        //    if(sendingDatums[i].lostState != 0){
        //        tempCount++;
        //    }
        //}
        //console.log(tempCount/$scope.count);
        $scope.sendingDatums = sendingDatums;
        //发送
        var sendingWindow = new SendingWindow($scope);
        for (var i = 0; i < $scope.defaultWindowSize; i++) {
            sendingWindow.push(sendingDatums[i]);
        }
        $scope.$watch('defaultWindowSize', function () {
            $('.default-window').velocity({width: $scope.defaultWindowSize * 50 + 'px'}, 100);
            sendingWindow.clear();
            for (var i = 0; i < $scope.defaultWindowSize; i++) {
                sendingWindow.push(sendingDatums[i]);
            }
        });

        $scope.start = function () {
            sendingWindow.sendAll();
            $('input').attr('disabled', 'disabled');
            $('.start-btn').attr('disabled', 'disabled');
        };
        //接收
        var receivingWindow = new ReceivingWindow($scope);
        $scope.receiver[0].addEventListener('DOMNodeInserted', function (event) {
            var target = event.target;
            target.setAttribute('id', target.getAttribute('id') + 'received')
            var receivingDatum = new Datum(target.id, $scope);
            receivingDatum.lostState = target.getAttribute('data-lostState');
            receivingWindow.receive(receivingDatum);
        });

        //确认
        $scope.confirm[0].addEventListener('DOMNodeInserted', function () {
            sendingWindow.confirm(event.target);
        });
    });

});