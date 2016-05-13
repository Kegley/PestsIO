var Hill = require('./Hill');
var Ant = require('./Ant');

function Player(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;
    this.nick;
    this.homeHill;

    //modes - Find Food = 0, Attack = 1
    this.mode = 0;

}
module.exports = Player;


Player.prototype.init = function(nick) {
    this.nick = nick;
    this.homeHill = new Hill(this.gameServer, this);
    console.log("New Player: " + nick);
}

Player.prototype.update = function() {

}

Player.prototype.remove = function() {
    if(this.homeHill != undefined){
        this.homeHill.remove();
    }
}
