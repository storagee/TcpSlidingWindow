function ReceivingWindow($scope) {
    this.datums = [];
    this.startIndex = 0;
    this.$scope = $scope;
    this.$progress = $('.receiving-window .cts-progress')
}

ReceivingWindow.prototype.updateUI = function () {
    var $scope = this.$scope;
    var receivingWindow = $('.receiving-window');
    if (this.startIndex >= ($scope.count - $scope.defaultWindowSize * 1 + 1)) {
        receivingWindow.css({
            left: this.startIndex * 50 + 'px',
            width: (this.$scope.count - this.startIndex) * 50 + 'px'
        }, 0);
        if(this.$scope.count - this.startIndex == 0){
            receivingWindow.css({display: 'none'});
        }
    } else {
        receivingWindow.css({left: this.startIndex * 50 + 'px'}, 0);
    }
};


ReceivingWindow.prototype.sort = function () {
    var compare = function (datum1, datum2) {
        if (datum1.getId() < datum2.getId()) {
            return -1;
        } else if (datum1.getId() > datum2.getId()) {
            return 1;
        } else {
            return 0;
        }
    };
    this.datums.sort(compare);
};

ReceivingWindow.prototype.getSendBackIndex = function () {
    if (!!this.datums[0] && this.datums[0].getId() == this.startIndex + 1) {
        var sendBackIndex = this.startIndex + 1;
        if (this.datums.length == 1) {
            return sendBackIndex;
        }
        for (var i = 1; i < this.datums.length; i++) {
            if (this.datums[i].getId() - this.datums[i - 1].getId() == 1) {
                sendBackIndex++;
                //console.log('sendBackIndex in loop:'+sendBackIndex);
                if (i == this.datums.length - 1) {
                    //此处，如果不是这样，就无返回了
                    return sendBackIndex;
                }
            } else {
                return sendBackIndex;
            }
        }
    } else {
        return this.startIndex;
    }
};

ReceivingWindow.prototype.sendBack = function () {
    this.sort();
    var sendBackIndex = this.getSendBackIndex();
    this.datums.splice(0, sendBackIndex - this.startIndex);
    this.startIndex = sendBackIndex;
    this.updateUI();
    //this.datums.splice(0, this.datums.length);
    //console.log('------------------');
    //console.log(this.datums);
    //console.log('------------------');
    this.$scope.receivingPlaces[sendBackIndex].sendingConfirm();
};

ReceivingWindow.prototype.accumulate = function () {
    var that = this;
    this.$scope.isRecAccumulating = true;
    this.$scope.firstReceiveTime = Date.now();
    this.$progress.stop(true, true);
    this.$progress.velocity({width: '0%'}, 0);
    this.$progress.velocity({width: '100%'}, this.$scope.recAccumulateTime);
    setTimeout(function () {
        that.sendBack();
        that.$progress.velocity({width: '0%'}, 0);
        that.$scope.isRecAccumulating = false;
    }, this.$scope.recAccumulateTime);
};

ReceivingWindow.prototype.isAlreadyIn = function (datum) {
    for (var i = 0; i < this.datums.length; i++) {
        if (datum.getId() == this.datums[i].getId()) {
            return true;
        }
    }
    return false;
};

ReceivingWindow.prototype.isConfirmed = function (datum) {
    return datum.getId() <= this.startIndex;
};

ReceivingWindow.prototype.receive = function (datum) {

    if (this.$scope.isAccumulate) {
        if (!this.isAlreadyIn(datum)) {
            if (!this.isConfirmed(datum)) {
                this.datums.push(datum);
                this.$scope.log('收到数据:' + datum.getId());
                if (!this.$scope.isRecAccumulating) {
                    this.accumulate();
                }
            } else {
                console.log('收到已确认的数据:' + datum.getId());
                this.$scope.error('收到已确认的数据:' + datum.getId())
                if (!this.$scope.isRecAccumulating) {
                    this.accumulate();
                }
            }
        } else {
            console.log('收到重复数据:' + datum.getId());
            this.$scope.error('收到重复数据:' + datum.getId());
        }
        //console.log(this.datums);
    }
};

ReceivingWindow.prototype.shiftN = function (n) {
    var datums = this.datums.splice(0, n);
    datums.forEach(function (datum, index, array) {
        datum.active();
    });
};