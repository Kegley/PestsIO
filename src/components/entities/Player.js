var Hill = require('./Hill');
var Ant = require('./Ant');

function Player(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;
    this.nick;
    this.homeHill;
    this.playerID = this.gameServer.getNextPlayerID();
    //modes - Find Food = 0, Attack = 1
    this.mode = 0;
    this.numAnts = 0;
}
module.exports = Player;


Player.prototype.init = function(nick) {
    this.nick = nick;
    this.homeHill = new Hill(this.gameServer, this);
    console.log("New Player: " + nick);
}

Player.prototype.update = function() {
    this.numAnts = this.homeHill.ants.length;
    //Build information to send to
    this.socket.sendPacket();
}

Player.prototype.remove = function() {
    if(this.homeHill != undefined){
        this.homeHill.remove();
    }
}

Player.prototype.setMode = function(mode) {
    this.homeHill.setMode(mode);
}
