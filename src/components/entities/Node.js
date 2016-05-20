var Position = require('./Position');


function Node(gameServer, position) {
    this.gameServer = gameServer;
    this.position = position;
    this.nodeID = this.gameServer.getNextNodeId();
}

module.exports = Node;

//PATHFINDING HERE

Node.prototype.move = function(x, y) {
    this.position.x = x;
    this.position.y = y;
}
