function SendingWindow($scope) {
    this.datums = [];
    this.startIndex = 0;
    this.$scope = $scope;
    this.timeoutId = null;
    this.timeoutQue = [];
    this.isSuccess = false;
    this.$progress = $('.sending-window .cts-progress')
}

SendingWindow.prototype.updateUI = function () {
    var $scope = this.$scope;
    var sendingWindow = $('.sending-window');
    if (this.startIndex >= ($scope.count - $scope.defaultWindowSize * 1 + 1)) {
        sendingWindow.css({
            left: this.startIndex * 50 + 'px',
            width: (this.$scope.count - this.startIndex) * 50 + 'px'
        }, 0);
        if(this.$scope.count - this.startIndex == 0){
            sendingWindow.css({display: 'none'});
        }
    } else {
        sendingWindow.css({left: this.startIndex * 50 + 'px'}, 0);
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
//SendingWindow.prototype.sendAll = function () {
//    var $scope = this.$scope;
//    this.datums.forEach(function (datum, index, array) {
//        setTimeout(function () {
//            (function (datum) {
//                var datum = datum;
//                datum.go('up');
//            })(datum);
//        }, $scope.td * index);
//    })
//};

SendingWindow.prototype.clear = function () {
    this.datums.splice(0, this.datums.length);
};

SendingWindow.prototype.send = function (sendCount, isSuccess) {
    var that = this;
    var $scope = this.$scope;
    var startIndex = this.datums.length - sendCount;
    //console.log(startIndex);
    this.$progress.stop(true, true);
    this.$progress.velocity({width: '0%'}, 0);
    this.$progress.velocity({width: '100%'}, $scope.rto);
    if(!isSuccess){
        this.timeoutId = setTimeout(function () {
            that.$scope.error('超时重传');
            console.log('超时重传');
            that.send(that.$scope.defaultWindowSize);
        }, this.$scope.rto);
        console.log('timeoutId:' + this.timeoutId);
        this.timeoutQue.push(this.timeoutId);
    }
    for (var i = startIndex; i < this.datums.length; i++) {
        setTimeout((function (datum) {
            return function () {
                if (datum != undefined && datum.getId() <= $scope.count) {
                    datum.go('up');
                    if (datum.getId() == 20) {
                        $scope.is20sended = true;
                    }
                }
            };
        })(this.datums[i]), this.$scope.td * (i - startIndex));
        //console.log(this.datums[i]);
    }
};

SendingWindow.prototype.confirm = function (target) {

    clearTimeout(this.timeoutId);
    //var timeoutQueIndex = this.timeoutQue.indexOf(this.timeoutId);
    //if (timeoutQueIndex != -1) {
    //    this.timeoutQue.splice(timeoutQueIndex, 1);
    //}
    this.$progress.stop(true, true);
    this.$progress.velocity({width: '0%'}, 0);
    var confirmIndex = event.target.id - this.$scope.count - 1;
    var windowSize = this.$scope.defaultWindowSize * 1;
    var start = windowSize + this.startIndex * 1;
    var end = windowSize + confirmIndex * 1;
    var sendCount = end - start;

    this.shiftN(end - start);
    this.datums = this.datums.concat(this.$scope.sendingDatums.slice(start, end));
    //console.log(this.datums);
    var isSuccess = confirmIndex == this.$scope.count;
    this.send(this.$scope.defaultWindowSize, isSuccess);
    if (!this.isSuccess && isSuccess) {
        this.isSuccess = true;
        bootbox.alert('传输成功！');
        this.timeoutQue.forEach(function (timeoutId, index, array) {
            clearTimeout(timeoutId);
        });
    }
};