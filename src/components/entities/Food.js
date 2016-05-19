var Position = require('./Position');
var Node = require('./Node');


function (gameServer, player, location) {
    console.log(location);
    Node.apply(this, Array.prototype.slice.call([gameServer, location]));
    console.log(arguments);
    this.gameServer = gameServer;
    this.homeHill = homeHill;
    this.player = player;
    this.FoodID = this.gameServer.getNextNodeId();
    this.gameServer.addFood(this);

    this.hasTarget = false;
    this.targetPosition = {}
    console.log(this);
}

module.exports = Food;

Food.prototype.update = function() {
    if(this.homeHill.mode) {
        //path find to hill
        console.log("attacking");
    }else {
        //path find to food
        console.log("looking for food");
    }
}

Food.prototype.remove = function() {
    this.gameServer.removeFood(this);
}

Food.prototype.move = function(x, y) {
    //crude AF, need to do slow movement to location
    //coming soon
    this.position.x = x;
    this.position.y = y;
}
