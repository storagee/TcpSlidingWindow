function Datum(id, $scope){
    this.$scope = $scope;
    this.id = id;
    this.lostState = 0;//0代表不丢失、1代表发送丢失、2代表确认丢失
}

Datum.prototype.go = function (direction) {
    var $scope = this.$scope;
    var that = this;
    if(direction == 'up'){
        var $datumElement = $('#'+this.id);
        var cloneDatum = $datumElement.clone();
        cloneDatum.css({position: 'absolute', left: 50*(cloneDatum.attr('id')-1) + 'px'});
        cloneDatum.removeClass('active');
        $datumElement.after(cloneDatum);
        var isLost = Math.random() < this.$scope.lostRate / 100;
        $scope.log('发送数据:'+this.getId());
        if(!isLost){
            //此处在发送阶段不丢失
            cloneDatum.velocity({bottom: this.$scope.distance+'px'}, (this.$scope.distance/this.$scope.speed)*1000, function () {
                cloneDatum.css({backgroundColor: 'black', color: 'white', border: 'solid 1px black', top: 0});
                cloneDatum.appendTo($scope.receiver);
            });
        }else{
            //发送阶段丢失
            cloneDatum.velocity({bottom: this.$scope.distance/2+'px', opacity: 0}, ((this.$scope.distance/2)/this.$scope.speed)*1000, function () {
                console.log('发送丢失:' + that.getId());
                that.$scope.error('发送数据'+(that.getId())+'丢失');
                cloneDatum.remove();
            });
        }
    }
    else if(direction == 'down'){
        var $datumElement = $('#'+this.id);
        var cloneDatum = $datumElement.clone();
        //cloneDatum.css({position: 'absolute', left: 50*(cloneDatum.attr('id')-1) + 'px'});
        cloneDatum.appendTo($('.receiver'));
        var isLost = Math.random() < this.$scope.lostRate / 100;
        if(!isLost){
            //确认阶段不丢失
            cloneDatum.velocity({top: this.$scope.distance+'px'}, (this.$scope.distance/this.$scope.speed)*1000, function () {
                cloneDatum.appendTo($scope.confirm);
                cloneDatum.remove();
            });
        }else{
            cloneDatum.velocity({top: this.$scope.distance+'px', opacity: 0}, ((this.$scope.distance)/this.$scope.speed)*1000, function () {
                console.log('确认丢失:'+that.getId());
                cloneDatum.remove();
            });
        }
    }
};

Datum.prototype.sendingConfirm = function () {
    var $scope = this.$scope;
    var that = this;
    var $sendBackSignal = $('#'+this.id);
    var cloneSignal = $sendBackSignal.clone();
    cloneSignal.css({position: 'absolute', left: 50*(cloneSignal.attr('id')-1-20) + 'px'});
    $scope.sendingConfirmContainer.append(cloneSignal);
    var randomNumber = Math.random();
    var isLost = randomNumber < this.$scope.lostRate / 100;
    $scope.log('确认数据:'+(this.getId()-20));
    if(!isLost){
        //确认阶段不丢失
        cloneSignal.velocity({top: this.$scope.distance+'px'}, (this.$scope.distance/this.$scope.speed)*1000, function () {
            cloneSignal.appendTo($scope.confirm);
            cloneSignal.remove();
        });
    }else{
        cloneSignal.velocity({top: this.$scope.distance/2+'px', opacity: 0}, ((this.$scope.distance/2)/this.$scope.speed)*1000, function () {
            console.log('确认丢失:'+(that.getId()-20));
            that.$scope.error('确认数据'+(that.getId()-20)+'丢失');
            cloneSignal.remove();
        });
    }
};

Datum.prototype.active = function(){
    var $datumElement = $('#'+this.id);
    $datumElement.addClass('active');
};

Datum.prototype.getId = function () {
    var id = this.id + '';
    if(id.indexOf('received') == -1){
        return id * 1;
    }else{
        return id.slice(0, this.id.indexOf('received')) * 1;
    }
};