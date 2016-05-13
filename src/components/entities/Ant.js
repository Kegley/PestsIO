function Ant(gameServer, homeHill, player) {
    this.gameServer = gameServer;
    this.homeHill = homeHill;
    this.player = player;

    this.gameServer.addAnt(this);

}

module.exports = Ant;

Ant.prototype.update = function() {
    if(this.homeHill.mode = 0) {
        //path find to hill
    }else {
        //path find to food
    }
}

Ant.prototype.remove = function() {
    this.gameServer.removeAnt(this);
}
