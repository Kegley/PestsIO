var Position = require('./Position');
var Node = require('./Node');


function Ant(gameServer, homeHill, player, location) {
    console.log(location);
    Node.apply(this, Array.prototype.slice.call([gameServer, location]));
    console.log(arguments);
    this.gameServer = gameServer;
    this.homeHill = homeHill;
    this.player = player;
    this.antID = this.gameServer.getNextNodeId();
    this.gameServer.addAnt(this);

    this.hasTarget = false;
    this.targetPosition = {}
    console.log(this);
}

module.exports = Ant;

Ant.prototype.update = function() {
    if(this.homeHill.mode) {
        //path find to hill
        console.log("attacking");
    }else {
        //path find to food
        console.log("looking for food");
    }
}

Ant.prototype.remove = function() {
    this.gameServer.removeAnt(this);
}

Ant.prototype.move = function(x, y) {
    //crude AF, need to do slow movement to location
    //coming soon
    this.position.x = x;
    this.position.y = y;
}
