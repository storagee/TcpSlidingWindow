function SendingWindow($scope) {
    this.datums = [];
    this.startIndex = 0;
    this.$scope = $scope;
}

SendingWindow.prototype.updateUI = function () {
    var $scope = this.$scope;
    var sendingWindow = $('.sending-window');
    if (this.startIndex >= ($scope.count - $scope.defaultWindowSize * 1 + 1)) {
        sendingWindow.velocity({
            left: this.startIndex * 50 + 'px',
            width: (this.$scope.count - this.startIndex) * 50 + 'px'
        }, 50);
    } else {
        sendingWindow.velocity({left: this.startIndex * 50 + 'px'}, 50);
    }
};

SendingWindow.prototype.push = function (datum) {
    this.datums.push(datum);
    this.updateUI();
};

SendingWindow.prototype.shiftN = function (n) {
    var datums = this.datums.splice(0, n);
    datums.forEach(function (datum, index, array) {
        datum.active();
    });
    this.startIndex += n * 1;
    this.updateUI();
};
SendingWindow.prototype.sendAll = function () {
    var $scope = this.$scope;
    this.datums.forEach(function (datum, index, array) {
        setTimeout(function () {
            (function (datum) {
                var datum = datum;
                datum.go('up');
            })(datum);
        }, $scope.td * index);
    })
};

SendingWindow.prototype.clear = function () {
    this.datums.splice(0, this.datums.length);
};

SendingWindow.prototype.sendNew = function (sendCount) {
    var $scope = this.$scope;
    var startIndex = this.datums.length - sendCount;
    for (var i = startIndex; i < this.datums.length; i++) {
        setTimeout((function (datum) {
            return function () {
                if(datum != undefined && datum.getId() <= $scope.count && !$scope.is20sended){
                    datum.go('up');
                    if(datum.getId() == 20){
                        $scope.is20sended = true;
                    }
                }
            };
        })(this.datums[i]), this.$scope.td * (i - startIndex));
    }
};

SendingWindow.prototype.confirm = function (target) {

    var confirmIndex = event.target.id.slice(0, event.target.id.indexOf('r'));
    var windowSize = this.$scope.defaultWindowSize * 1;
    var start = windowSize + this.startIndex * 1;
    var end = windowSize + confirmIndex * 1;
    var sendCount = end - start;

    this.shiftN(end - start);
    this.datums = this.datums.concat(this.$scope.sendingDatums.slice(start, end));
    this.sendNew(sendCount);
};