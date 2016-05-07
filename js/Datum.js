function Datum(id, $scope){
    this.$scope = $scope;
    this.id = id;
    this.lostState = 0;//0代表不丢失、1代表发送丢失、2代表确认丢失
}

Datum.prototype.go = function (direction) {
    var $scope = this.$scope;
    if(direction == 'up'){
        var $datumElement = $('#'+this.id);
        var cloneDatum = $datumElement.clone(true);
        cloneDatum.css({position: 'absolute', left: 50*(cloneDatum.attr('id')-1) + 'px'});
        $datumElement.before(cloneDatum);
        if(this.lostState == 0 || this.lostState == 2){
            //此处在发送阶段不丢失
            cloneDatum.velocity({bottom: this.$scope.distance+'px'}, (this.$scope.distance/this.$scope.speed)*1000, function () {
                cloneDatum.css({backgroundColor: 'black', color: 'white', border: 'solid 1px black', top: 0});
                cloneDatum.appendTo($scope.receiver);
            });
        }else if(this.lostState == 1){
            //发送阶段丢失
            cloneDatum.velocity({bottom: this.$scope.distance+'px', opacity: 0}, ((this.$scope.distance)/this.$scope.speed)*1000, function () {
                console.log('sending lost');
                cloneDatum.remove();
            });
        }
    }else if(direction == 'down'){
        var $datumElement = $('#'+this.id);
        var cloneDatum = $datumElement.clone(true);
        //cloneDatum.css({position: 'absolute', left: 50*(cloneDatum.attr('id')-1) + 'px'});
        cloneDatum.appendTo($('.receiver'));
        if(this.lostState == 0){
            //确认阶段不丢失
            cloneDatum.velocity({top: this.$scope.distance+'px'}, (this.$scope.distance/this.$scope.speed)*1000, function () {
                cloneDatum.appendTo($scope.confirm);
                cloneDatum.remove();
            });
        }else{
            cloneDatum.velocity({top: this.$scope.distance+'px', opacity: 0}, ((this.$scope.distance)/this.$scope.speed)*1000, function () {
                console.log('confirm lost');
                cloneDatum.remove();
            });
        }
    }
};

Datum.prototype.active = function(){
    var $datumElement = $('#'+this.id);
    $datumElement.addClass('active');
};

Datum.prototype.getId = function () {
    var id = this.id + '';
    if(id.indexOf('received') == -1){
        return id;
    }else{
        return id.slice(0, this.id.indexOf('received'));
    }
};
