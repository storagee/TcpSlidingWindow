var myApp = angular.module('myApp', []);

myApp.controller('Controller', function ($scope) {

    //累积确认
    $scope.isRecAccumulating = false;
    $scope.firstReceiveTime = null;
    $scope.recAccumulateTime = 1000;//1000比较好
    $scope.isAccumulate = true;

    $scope.distance = 300;
    $scope.count = 20;
    $scope.speed = 250;
    $scope.td = 200;//发送延时
    $scope.defaultWindowSize = 5;
    $scope.sender = $('.sender');
    $scope.sendingConfirmContainer = $('.sending-confirm-container');
    $scope.receiver = $('.receiving-container');
    $scope.confirm = $('.confirm-container');
    $scope.sendingWindowSize = $scope.defaultWindowSize;
    $scope.receivingWindowSize = $scope.defaultWindowSize;
    $scope.rto = 5000;//超时重传时间
    $scope.rtt = ($scope.distance / $scope.speed) * 1000;

    $scope.$watch('speed', function () {
        $scope.rtt = ($scope.distance / $scope.speed) * 1000;
    });

    $scope.lostRate = 10;
    var normalPlace = $('.normal');
    var errorPlace = $('.error');
    normalPlace.mCustomScrollbar({
        theme: "dark",
        scrollButtons: {
            enable: false
        },
        autoHideScrollbar: true,
        scrollInertia: 100,
        horizontalScroll: false
    });
    errorPlace.mCustomScrollbar({
        theme: "dark",
        scrollButtons: {
            enable: false
        },
        autoHideScrollbar: true,
        scrollInertia: 100,
        horizontalScroll: false
    });
    var normalPlaceScr = normalPlace.find('.mCSB_container');
    var errorPlaceScr = errorPlace.find('.mCSB_container');
    $scope.log = function (value) {
        normalPlaceScr.prepend('<li>' + value + '</li>');
    };
    $scope.error = function (value) {
        errorPlaceScr.prepend('<li>' + value + '</li>');
    };
    $scope.reset = function () {
        location.reload();
    };
    $scope.is20sended = false;//fix bug

    //初始化数据
    var receivingPlaces = [];
    var sendingDatums = [];
    for (var i = 0; i < $scope.count; i++) {
        var receivingPlace = new Datum(i + 1 + $scope.count, $scope);
        receivingPlaces.push(receivingPlace);
        var sendingDatum = new Datum(i + 1, $scope);
        sendingDatums.push(sendingDatum);
    }
    receivingPlaces.push(new Datum(1 + $scope.count * 2, $scope));

    $scope.receivingPlaces = receivingPlaces;
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
        sendingWindow.send($scope.defaultWindowSize);
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