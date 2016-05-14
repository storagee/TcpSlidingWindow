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

    var isInSendingWindow = function (datum) {
        // 用于防止在发送时延内，窗口已经向前移动的情况，就是已经进入setTimeout，但是窗口向前移动的情况
        return datum.getId() > that.startIndex;
    };

    for (var i = startIndex; i < this.datums.length; i++) {
        setTimeout((function (datum) {
            return function () {
                if (datum != undefined && datum.getId() <= $scope.count && isInSendingWindow(datum)) {
                    datum.go('up');
                    $scope.sendingTotalCount++;
                    if (datum.getId() == 20) {
                        $scope.is20sended = true;
                    }
                }
            };
        })(this.datums[i]), this.$scope.td * (i - startIndex));
    }
};

SendingWindow.prototype.confirm = function (target) {

    clearTimeout(this.timeoutId);
    //var timeoutQueIndex = this.timeoutQue.indexOf(this.timeoutId);
    //if (timeoutQueIndex != -1) { auth : laizhihui
    //    this.timeoutQue.splice(timeoutQueIndex, 1);
    //}
    var that = this;
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
        var totalTime = Date.now() - this.$scope.startTime;
        //bootbox.alert('传输成功！总用时：'+totalTime + 'ms');
        showSuccessInfo();
        this.timeoutQue.forEach(function (timeoutId, index, array) {
            clearTimeout(timeoutId);
        });
    }

    function showSuccessInfo(){
        bootbox.dialog({
            title: '传输成功! 总用时：'+totalTime/1000 + 's',
            message: $('#tpl').html(),
            buttons: {
                ok: {
                    label: '好'
                }
            }
        });

        var repeatRate = (that.$scope.repeatCount / that.$scope.sendingTotalCount) * 100;
        var sendingLostRate = (that.$scope.realSendingLostCount / that.$scope.sendingTotalCount) * 100;
        var confirmLostRate = (that.$scope.realConfirmLostCount / that.$scope.confirmTotalCount) * 100;
        $('.repeat-rate').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: 'TCP 传输数据分析 数据重复率'
            },
            //subtitle: {
            //    text: 'fdsafdsf'
            //},
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y:.1f}%'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
            },
            series: [{
                name: '数据重复率',
                colorByPoint: true,
                data: [{
                    name: '重复的数据',
                    y: repeatRate
                    //drilldown: 'Microsoft Internet Explorer'
                }, {
                    name: '正常到达的数据',
                    y: 100 - repeatRate
                    //drilldown: 'Chrome'
                }]
            }]
        });

        setTimeout(function () {
            // Create the chart
            $('.rel-lost-rate').highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: '实际发送丢失率'
                },
                //subtitle: {
                //    text: 'fdsafdsf'
                //},
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}: {point.y:.1f}%'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [{
                    name: '实际发送丢失率',
                    colorByPoint: true,
                    data: [{
                        name: '发送丢失的数据',
                        y: sendingLostRate
                        //drilldown: 'Microsoft Internet Explorer'
                    }, {
                        name: '正常到达的数据',
                        y: 100 - sendingLostRate
                        //drilldown: 'Chrome'
                    }]
                }]
            });
            $('.rel-confirm-lost-rate').highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: '实际确认丢失率'
                },
                //subtitle: {
                //    text: 'fdsafdsf'
                //},
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}: {point.y:.1f}%'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [{
                    name: '实际确认丢失率',
                    colorByPoint: true,
                    data: [{
                        name: '确认丢失的数据',
                        y: confirmLostRate
                        //drilldown: 'Microsoft Internet Explorer'
                    }, {
                        name: '确认正常的数据',
                        y: 100 - confirmLostRate
                        //drilldown: 'Chrome'
                    }]
                }]
            });
        }, 500);
    }
};