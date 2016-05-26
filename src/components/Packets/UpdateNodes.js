function UpdateNodes(player, hills, ants, food) {
    this.player = player;
    this.hills = hills;
    this.ants = ants;
    this.food = food;
}

module.exports = UpdateNodes;

UpdateNodes.prototype.build = function() {
    var packet = {};
    packet.world = {
            width: this.player.gameServer.config.mapBorderRight - this.player.gameServer.config.mapBorderLeft,
            height: this.player.gameServer.config.mapBorderBottom - this.player.gameServer.config.mapBorderTop,
            mapBorderBottom: this.player.gameServer.config.mapBorderBottom,
            mapBorderRight: this.player.gameServer.config.mapBorderRight,
            mapBorderTop: this.player.gameServer.config.mapBorderTop,
            mapBorderLeft: this.player.gameServer.config.mapBorderLeft
    };
    packet.food = [];
    for(var i = 0; i < this.food.length; ++i){
        packet.food.push({
            id: this.food[i].nodeID,
            position: this.food[i].position,
            size: this.food[i].size,
            value: this.food[i].value,
            color: this.food[i].color,
            isOrbiting: this.food[i].isOrbiting,
        })
    }
    packet.food.push({
        id: this.player.gameServer.testNode.nodeID,
        position: this.player.gameServer.testNode.position,
        size: this.player.gameServer.testNode.size,
        value: this.player.gameServer.testNode.value,
        color: this.player.gameServer.testNode.color,
        isOrbiting: false,
    })

    packet.hill = [];
    for(var i = 0; i < this.hills.length; ++i){
        packet.hill.push({
            id: this.hills[i].player.playerID,
            playerNick: this.hills[i].player.nick,
            position: this.hills[i].position,
            radius: this.hills[i].radius,
            food: this.hills[i].food,
            numAnts: this.hills[i].numAnts
        })
    }

    packet.player = {
        id: this.player.playerID,
        nick: this.player.nick,
        position: this.player.position,
        viewBox: this.player.viewBox,
        hill: {
            position: this.player.homeHill.position,
            numAnts: this.player.homeHill.numAnts,
            food: this.player.homeHill.food,
            radius: this.player.homeHill.radius
        },
    };

    return packet;
};
