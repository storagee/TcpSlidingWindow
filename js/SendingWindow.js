function SendingWindow($scope){
    this.datums = [];
    this.startIndex = 0;
    this.$scope = $scope;
}

SendingWindow.prototype.updateUI = function () {
    var $scope = this.$scope;
    var sendingWindow = $('.sending-window');
    if (this.startIndex >= ($scope.count-$scope.defaultWindowSize*1+1)) {
        sendingWindow.velocity({left: this.startIndex * 50 + 'px',width: (this.$scope.count - this.startIndex) * 50 + 'px'}, 50);
    }else {
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
    this.startIndex += n;
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

SendingWindow.prototype.sendNew = function () {
    if(this.datums[this.datums.length-1] != undefined){
        this.datums[this.datums.length-1].go('up');
    }
};