var Position = require('./Position');


function Node(gameServer, location) {
    console.log("Node Created");
    console.log(arguments);
    console.log(location);
    this.position = new Position(location.x, location.y, location.direction);
    this.lol = "LOL";
}

module.exports = Node;

//PATHFINDING HERE
