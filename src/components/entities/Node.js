var Position = require('./Position');


function Node(gameServer, position) {
    this.gameServer = gameServer;
    this.position = position;
    this.destination = new Position(this.position.x, this.position.y);
    this.hasDestination = false;
    this.degree = 0;
    this.isOrbiting = false;
    this.orbitParent;
    this.nodeID = this.gameServer.getNextNodeId();


    this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
    this.size = 1;
    this.speed = 1;


}

module.exports = Node;

//PATHFINDING HERE

Node.prototype.move = function() {
    if(this.isOrbiting) {
        console.log("Orbiting");
        this.orbit();
        return;
    }
    if(this.destination.equals(this.position)) {
        //console.log("dest");
        return;
    }
    var dist = this.gameServer.getDist(this.destination.x, this.destination.y, this.position.x, this.position.y);
    var angle = this.gameServer.getAngle(this.destination.x, this.destination.y, this.position.x, this.position.y);
    var speed = Math.min((dist / (this.size * 5)), this.speed);
    //console.log(speed);
    this.position.setPosition(this.position.x + speed * Math.sin(angle), this.position.y + speed * Math.cos(angle));

    this.checkBorderPosition();
}

Node.prototype.orbit = function() {
    var angle = (this.speed * 90) * (Math.PI/180); // Convert to radians
    var rotatedX = Math.cos(angle) * (this.position.x - this.destination.x) - Math.sin(angle) * (this.position.y-this.destination.y) + this.destination.x;
    var rotatedY = Math.sin(angle) * (this.position.x - this.destination.x) + Math.cos(angle) * (this.position.y - this.destination.y) + this.destination.y;

}




Node.prototype.collisionCheck = function(node) {
    var left = this.position.x - this.size/2;
    var right = this.position.x + this.size/2;
    var top = this.position.y - this.size/2;
    var bottom = this.position.y + this.size/2;
    // Collision checking
    var nodeLeft = node.position.x - node.size/2;
    var nodeRight = node.position.x + node.size/2;
    var nodeTop = node.position.y - node.size/2;
    var nodeBottom = node.position.y + node.size/2;

    return !(left > nodeRight || right < nodeLeft || top > nodeBottom || bottom < nodeTop);
};

// This collision checking function is based on CIRCLE shape
Node.prototype.collisionCheck2 = function(objectSquareSize, objectPosition) {
    // IF (O1O2 + r <= R) THEN collided. (O1O2: distance b/w 2 centers of cells)
    // (O1O2 + r)^2 <= R^2
    // approximately, remove 2*O1O2*r because it requires sqrt(): O1O2^2 + r^2 <= R^2

    var dx = this.position.x - objectPosition.x;
    var dy = this.position.y - objectPosition.y;

    return (dx * dx + dy * dy + this.getSquareSize() <= objectSquareSize);
};

Node.prototype.setSize = function(size) {
    this.size = size;
}

Node.prototype.setColor = function(color) {
    this.color = color;
}

Node.prototype.isCollidingWithBorder = function() {
    if(this.position.x < this.gameServer.config.mapBorderLeft) {
        //console.log("Out of Bounds Left");
        return true;
    }
    if(this.position.x > this.gameServer.config.mapBorderRight - 1) {
        //console.log("Out of Bounds Right");
        return true;
    }
    if(this.position.y < this.gameServer.config.mapBorderTop) {
        //console.log("Out of Bounds Top");
        return true;
    }
    if(this.position.y > this.gameServer.config.mapBorderBottom - 1) {
        //console.log("Out of Bounds Bottom");
        return true;
    }
    return false;
}


Node.prototype.checkBorderPosition = function() {
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
