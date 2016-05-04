function ReceivingWindow($scope) {
    this.datums = [];
    this.startIndex = 0;
    this.$scope = $scope;
}

ReceivingWindow.prototype.updateUI = function () {
    var $scope = this.$scope;
    var receivingWindow = $('.receiving-window');
    if (this.startIndex >= ($scope.count - $scope.defaultWindowSize * 1 + 1)) {
        receivingWindow.velocity({
            left: this.startIndex * 50 + 'px',
            width: (this.$scope.count - this.startIndex) * 50 + 'px'
        }, 50);
    } else {
        receivingWindow.velocity({left: this.startIndex * 50 + 'px'}, 50);
    }
};

ReceivingWindow.prototype.receive = function (datum) {

    var that = this;

    var isDatumValid = function (datum) {
        //如果接收窗口还没有元素，则判断进来的datum是不是第一个元素;
        if(that.datums.length == 0){
            if(datum.getId() == 1){
                return true;
            }else{
                return false;
            }
        }else{
            //如果接收窗口有元素了，那么必须是相连的元素
            var lastDatum = that.datums[that.datums.length-1];
            if(datum.getId()-lastDatum.getId() == 1){
                return true;
            }else{
                return false;
            }
        }
    };

    if(isDatumValid(datum)){
        this.datums.push(datum);
        datum.go('down');
        //this.shiftN(1);
        this.startIndex++;
        this.updateUI();
    }else{
        //console.log(this.datums);
    }
};

ReceivingWindow.prototype.shiftN = function (n) {
    var datums = this.datums.splice(0, n);
    datums.forEach(function (datum, index, array) {
        datum.active();
    });
};