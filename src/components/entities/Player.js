var UpdateNodes = require('../Packets/UpdateNodes');

var Hill = require('./Hill');
var Ant = require('./Ant');

function Player(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;

    this.nick;
    this.playerID = this.gameServer.getNextPlayerID();

    //Visibility
    this.sightX = 100;
    this.sightY = 100;

    this.position;
    this.mapCenter = {
        x: this.gameServer.config.mapCenterX,
        y: this.gameServer.config.mapCenterY
    }
    this.viewBox = {
        topY: 0,
        bottomY: 0,
        leftX: 0,
        rightX: 0,
        width: 0, // Half-width
        height: 0 // Half-height
    };


    this.homeHill;
    this.mode = 0; // Attacking = 0; Eating = 1;
    this.numAnts = 0;


}
module.exports = Player;


Player.prototype.init = function(nick) {
    this.nick = nick;
    this.homeHill = new Hill(this.gameServer, this);
    this.position = this.homeHill.position;

    console.log("New Player: " + nick);
}

Player.prototype.update = function() {
    this.numAnts = this.homeHill.ants.length;
    //Build information to send to
    this.calcViewBox();
    var foods = this.getFoodInView(this.viewBox);
    this.socket.sendPacket(
        new UpdateNodes(
            this.getHillsInView(),
            this.getAntsInView(),
            this.getFoodInView()
        )
    );
}

Player.prototype.remove = function() {
    if(this.homeHill != undefined){
        this.homeHill.remove();
    }
}

Player.prototype.setMode = function(mode) {
    this.homeHill.setMode(mode);
}

Player.prototype.print = function() {
    return "Player: " + this.playerID + ":" + this.nick + ", Food: " + this.homeHill.food + ", Radius: " + this.homeHill.radius +  ", Ants: " + this.numAnts;
}


/* PLAYER UPDATE RELATED CODE */

Player.prototype.calcViewBox = function() {
    this.viewBox.topY = this.mapCenter.y - this.sightY;
    this.viewBox.bottomY  = this.mapCenter.y + this.sightY;
    this.viewBox.leftX = this.mapCenter.x - this.sightX;
    this.viewBox.rightX = this.mapCenter.x + this.sightX;
}

Player.prototype.getAntsInView = function(viewBox) {
    return this.gameServer.ants;
}

Player.prototype.getFoodInView = function(viewBox) {
    return this.gameServer.foods;
}

Player.prototype.getHillsInView = function(viewBox) {
    return this.gameServer.hills;
}
