var Position = require('./Position');
var Node = require('./Node');


function Food(gameServer, location) {
    Node.apply(this, Array.prototype.slice.call([gameServer, location]));
    this.gameServer.addFood(this);
    this.decayRate = 1;

    //get value of food 50 max// for now
    this.value = Math.floor(Math.random() * (50 - 0 + 1)) + 0;
}

module.exports = Food;

Food.prototype.update = function() {
    if(this.value <= 0) {
        this.remove(this);
        return;
    }
    if(this.decay()) {
        --this.value;
    }
}

Food.prototype.remove = function() {
    this.gameServer.removeFood(this);
}

Food.prototype.eat = function(amt) {
    //subtract eat amount if theres atleast that amount
    if(this.value > amt) {
        this.value = this.value - amt;
        return amt;
    }else {
        //Don't let them eat more than is available
        amt = this.value;
        this.value = 0;
        return amt;
    }
}

Food.prototype.decay = function() {
    var min = 0;
    var max = 100;
    willDecay = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.decayRate >= willDecay;
}

Food.prototype.print = function() {
    return "Food: " + this.pad(this.nodeID, 3, " ") + " "+ this.position.print()
}
