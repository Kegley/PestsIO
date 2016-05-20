function UpdateNodes(hills, ants, food) {
    this.hills = hills;
    this.ants = ants;
    this.food = food;
}

module.exports = UpdateNodes;

UpdateNodes.prototype.build = function() {
    var packet = {};
    packet.food = [];
    for(var i = 0; i < this.food.length; ++i){
        packet.food.push({
            id: this.food[i].nodeID,
            position: this.food[i].position
        })
    }
    packet.hill = [];
    for(var i = 0; i < this.hills.length; ++i){
        packet.hill.push({
            id: this.hills[i].player.playerID,
            position: this.hills[i].position,
            radius: this.hills[i].radius,
            food: this.hills[i].food,
            numAnts: this.hills[i].numAnts
        })
    }
    return packet;
};
