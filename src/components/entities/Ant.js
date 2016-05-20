var Position = require('./Position');
var Node = require('./Node');


function Ant(gameServer, homeHill, player, location) {
    Node.apply(this, Array.prototype.slice.call([gameServer, location]));
    this.homeHill = homeHill;
    this.player = player;

    this.gameServer.addAnt(this);

    this.hasTarget = false;
    this.targetPosition = {}
}

module.exports = Ant;

Ant.prototype.update = function() {
    if(this.homeHill.mode) {
        //path find to hill
    }else {
        //path find to food
    }
}

Ant.prototype.remove = function() {
    this.gameServer.removeAnt(this);
}
