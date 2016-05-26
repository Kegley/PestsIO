var Player = require('./entities/Player');
var Position = require('./entities/Position');

function PacketHandler(gameServer, socket) {
    console.log("")
    this.gameServer = gameServer;
    this.socket = socket;


}

module.exports = PacketHandler;


PacketHandler.prototype.handleMessage = function(message) {
    // Discard empty messages or invalid codes

    message = JSON.parse(message);
    if (message.length == 0) {
        return;
    }
    id = message.id;
    message = message.msg;
    switch (id) {
        case 0:
            // Check for invalid packet
            if (message == undefined) {
                console.log("Broken");
                //break;
            }
            if(this.socket.player.nick != undefined){
                return;
            }

            // Set Nickname
            nick = message;
            this.socket.player.init(nick);
            break;
        case 1:
            console.log("Eating Food");
            this.socket.player.setMode(0);
            break;
        case 2:
            console.log("Attacking Hill");
            this.socket.player.setMode(1);
            break;
        case 3://mousemovement
            this.socket.player.mousePos.setPosition(message.x, message.y);
            break;
        case 4://mousemovement
            console.log("Clicked @ " + message.x + ", " + message.y);
            break;
        case 255:
            // Connection Start
            break;
        default:
            break;
    }
};
