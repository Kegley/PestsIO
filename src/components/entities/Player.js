var UpdateNodes = require('../Packets/UpdateNodes');

var Hill = require('./Hill');
var Ant = require('./Ant');
var Position = require('./Position');

function Player(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;

    this.nick;
    this.playerID = this.gameServer.getNextPlayerID();

    //Visibility
    this.sightX = 100;
    this.sightY = 100;

    this.position = new Position(0, 0);
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
    //mouse position to calculate speed of moving around
    this.mousePos = new Position(0, 0);

    this.homeHill;
    this.mode = 0; // Attacking = 0; Eating = 1;
    this.numAnts = 0;


}
module.exports = Player;


Player.prototype.init = function(nick) {
    this.nick = nick;
    this.homeHill = new Hill(this.gameServer, this);
    this.position.setPosition(this.homeHill.position.x, this.homeHill.position.y);
    this.mousePos.setPosition(this.homeHill.position.x, this.homeHill.position.y);
    console.log("New Player: " + nick);
}

Player.prototype.update = function() {
    this.numAnts = this.homeHill.ants.length;
    //Build information to send to
    this.calcViewBox();
    var foods = this.getFoodInView(this.viewBox);
    this.move();
    this.socket.sendPacket(
        new UpdateNodes(
            this,
            this.getHillsInView(this.viewBox),
            this.getAntsInView(this.viewBox),
            this.getFoodInView(this.viewBox)
        )
    );
}







/* PLAYER UPDATE RELATED CODE */

Player.prototype.calcViewBox = function() {
    this.viewBox.topY = this.position.y - this.sightY;
    this.viewBox.bottomY  = this.position.y + this.sightY;
    this.viewBox.leftX = this.position.x - this.sightX;
    this.viewBox.rightX = this.position.x + this.sightX;
    this.viewBox.width = this.sightX * 2;
    this.viewBox.height = this.sightY*2;
}

Player.prototype.checkBorderPosition = function() {
    if(this.position.x < this.gameServer.config.mapBorderLeft) {
        //console.log("Out of Bounds Left");
        this.position.x = this.gameServer.config.mapBorderLeft;
    }
    if(this.position.x > this.gameServer.config.mapBorderRight - 1) {
        //console.log("Out of Bounds Right");
        this.position.x = this.gameServer.config.mapBorderRight - 1;
    }
    if(this.position.y < this.gameServer.config.mapBorderTop) {
        //console.log("Out of Bounds Top");
        this.position.y = this.gameServer.config.mapBorderTop;
    }
    if(this.position.y > this.gameServer.config.mapBorderBottom - 1) {
        //console.log("Out of Bounds Bottom");
        this.position.y = this.gameServer.config.mapBorderBottom - 1;
    }
}

Player.prototype.getAntsInView = function(viewBox) {
    var ants = this.gameServer.ants;
    var antsInSight = [];
    for(var i = 0; i < ants.length; ++i) {
        if(ants[i].position.x > viewBox.leftX && ants[i].position.x < viewBox.rightX &&
                ants[i].position.y > viewBox.topY && ants[i].position.y < viewBox.bottomY){
                    antsInSight.push(ants[i]);
        }
    }
    return antsInSight;
}

Player.prototype.getFoodInView = function(viewBox) {
    var foods = this.gameServer.foods;
    var foodsInSight = [];
    for(var i = 0; i < foods.length; ++i) {
        if(foods[i].position.x > viewBox.leftX && foods[i].position.x < viewBox.rightX &&
                foods[i].position.y > viewBox.topY && foods[i].position.y < viewBox.bottomY){
                    foodsInSight.push(foods[i]);
        }
    }
    return foodsInSight;
}

Player.prototype.getHillsInView = function(viewBox) {
    return this.gameServer.hills;
}

Player.prototype.move = function() {
    if(this.mousePos.equals(this.position)) { return; }
    var dist = this.gameServer.getDist(this.mousePos.x, this.mousePos.y, this.position.x, this.position.y);
    var angle = this.gameServer.getAngle(this.mousePos.x, this.mousePos.y, this.position.x, this.position.y);
    var speed = Math.min(dist / 30, 2.5);

    this.position.setPosition(this.position.x + speed * Math.sin(angle), this.position.y + speed * Math.cos(angle));

    this.checkBorderPosition();

}

Player.prototype.print = function() {
    return "Player: " + this.playerID + ":" + this.nick + ", Food: " + this.homeHill.food + ", Radius: " + this.homeHill.radius +  ", Ants: " + this.numAnts;
}

Player.prototype.remove = function() {
    if(this.homeHill != undefined){
        this.homeHill.remove();
    }
}

Player.prototype.setMode = function(mode) {
    this.homeHill.setMode(mode);
}
