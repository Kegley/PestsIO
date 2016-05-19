/* Hill represents the players homebase, each player has one Hill */
var Position = require('./Position');
var Ant = require('./Ant');

function Hill(gameServer, player) {
    this.gameServer = gameServer;
    this.player = player;

    //HILL LEVEL/SIZE
    this.food = 0;
    this.radius = 0;

    //HILL COLONY
    this.ants = [];
    this.congif = {
        maxNumAnts:10,
        maxRadius: 25
    }
    this.gameServer.addHill(this);
    this.ants.push(new Ant(this.gameServer, this, this.player, new Position(0, 0, 0)));

    //modes - Find Food = 0, Attack = 1
    this.mode = 0;
}

module.exports = Hill;

Hill.prototype.update = function() {
    if(this.mode) {
        //path find to hill
    }else {
        //path find to food
    }
}

Hill.prototype.remove = function() {
    for(var i = 0; i < this.ants.length; ++i) {
        this.ants[i].remove();
    }
    this.gameServer.removeHill(this);
}

Hill.prototype.setMode = function(mode) {
    if(mode >= 0 && mode <= 1) {
        this.mode = mode;
    }
}
