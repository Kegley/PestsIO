var Player = require('./entities/Player');

function PacketHandler(gameServer, socket) {
    console.log("")
    this.gameServer = gameServer;
    this.socket = socket;

}

module.exports = PacketHandler;


PacketHandler.prototype.handleMessage = function(message) {
    // Discard empty messages or invalid codes
    if (message.length == 0) {
        return;
    }
    message = message.split(',');
    id = parseInt(message[0]);
    console.log(message);

    switch (id) {
        case 0:
            // Check for invalid packet
            if (message[1] === undefined) {
                console.log("Broken");
                //break;
            }
            if(this.socket.player.nick != undefined){
                return;
            }

            // Set Nickname
            nick = message[1];
            this.socket.player.init(nick);
            break;
        case 1:
            console.log("Eating Food");
            break;
        case 2:
            console.log("Attacking Hill");
            break;
        case 255:
            // Connection Start
            break;
        default:
            break;
    }
};
