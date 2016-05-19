var WebSocket = require('ws');
var http = require('http');
var fs = require("fs");

var Logs = require('./components/utils/Logs');
var Messages = require('./components/WSMessages');

var Player = require('./components/entities/Player');


function GameServer() {
    console.log("Creating Game Server");

    //INITAL SETUP
    this.running = true;

    //UTILITIES SETUP
    this.commands;
    this.log = new Logs()

    //CLOCK SETUP
    this.time = +new Date;
    this.startTime = this.time;
    this.tick = 0;
    this.fullTick = 0;
    this.tickMain = 0;
    this.tickSpawn = 0;

    //SERVER INFORMATION
    this.clients = [];
    this.hills = [];
    this.ants = [];

    //REGISTRATION INFORMATION
    this.lastPlayerId = 0;

    //config for GameServer - May differ per node
    this.config = {
        mapBorderTop: 0,
        mapBorderBottom: 500,
        mapBorderLeft: 0,
        mapBorderRight: 500,
        serverLogLevel: 2,
        serverPort: 443, // Server port


    }



}

module.exports = GameServer;

GameServer.prototype.start = function() {
    //setup logs
    this.log.setup(this);
    console.log("Started Game Server");


    //Start the Socketed Server
    this.ConnectionSetup();


}

GameServer.prototype.ConnectionSetup = function() {
    // Start the server
    this.socketServer = new WebSocket.Server({
        port: this.config.serverPort,
        perMessageDeflate: false
    }, function() {

        //pre-setup-here

        // Start Main Loop
        setInterval(this.mainLoop.bind(this), 1);

        // Done
        console.log("[Game] Listening on port " + this.config.serverPort);
        console.log("[Game] Game is Running");

        // May do testing here later.

    }.bind(this));

    this.socketServer.on('connection', connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', function err(e) {
        switch (e.code) {
            case "EADDRINUSE":
            console.log("[Error] Server could not bind to port! Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
            break;
            case "EACCES":
            console.log("[Error] Please make sure you are running Ogar with root privileges.");
            break;
            default:
            console.log("[Error] Unhandled error code: " + e.code);
            break;
        }
        process.exit(1); // Exits the program
    });
    function connectionEstablished(ws) {
        console.log("Establishing Connection: " + ws._socket.remoteAddress);
        if (this.clients.length >= this.config.serverMaxConnections) { // Server full
            ws.close();
            return;
        }
        //CLOSING THE CONNECTION HANDLED HERE
        //FUTURE: ADD SAFE GUARDS
        function close(error) {
            // Log disconnections
            this.server.log.onDisconnect(this.socket.remoteAddress);
            console.log("Disconnecting: " + this.socket.remoteAddress);
            this.socket.player.remove();
            this.server.removeClient(this.socket);
            this.socket.sendPacket = function() {
                return;
            }; // Clear function so no packets are sent
        }

        ws.remoteAddress = ws._socket.remoteAddress;
        ws.remotePort = ws._socket.remotePort;
        this.log.onConnect(ws.remoteAddress); // Log connections

        //Create a Player
        ws.player = new Player(this, ws);
        //Handling Packets from client
        ws.packetHandler = new Messages(this, ws);
        //HANDLE MESSAGES HERE
        ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

        var bindObject = {
            server: this,
            socket: ws
        };
        ws.on('error', close.bind(bindObject));
        ws.on('close', close.bind(bindObject));
        this.clients.push(ws);
    }

    //this.startStatsServer(this.config.serverStatsPort);
}

//COMPLETELY STOLEN FROM Ogar
GameServer.prototype.mainLoop = function() {    // Timer
    var local = new Date();
    this.tick += (local - this.time);
    this.time = local;

    if (!this.running) return;

    if (this.tick >= 25) {
        this.fullTick++;
        //MOVEMENT TICK
        setTimeout(this.moveClients.bind(this), 0);

        if (this.fullTick >= 2) {
            // Loop main functions
            setTimeout(this.updateClients.bind(this), 0);
            setTimeout(this.updateAnts.bind(this), 0);
            setTimeout(this.updateHills.bind(this), 0)


            this.tickMain++;
            if (this.tickMain >= 4) { // 250 milliseconds
                // Update leaderboard with the gamemode's method
                //<<CODE HERE>>
                this.tickMain = 0; // Reset
            }
            this.fullTick = 0; // Reset
        }

        // Debug
        //console.log(this.tick - 25);
        // Reset
        this.tick = 0;
    }
};


GameServer.prototype.addAnt = function (ant) {
    this.ants.push(ant);
}

GameServer.prototype.addHill = function (hill) {
    this.hills.push(hill)
}

GameServer.prototype.getNextNodeId = function() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
        this.lastNodeId = 1;
    }
    return this.lastNodeId++;
};

GameServer.prototype.getNextPlayerID = function() {
    // Resets integer
    if (this.lastPlayerId > 2147483647) {
        this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
};

GameServer.prototype.moveClients = function() {

}

GameServer.prototype.removeAnt = function (ant) {
    var antID = -1;
    for(var i = 0; i < this.ants.length; ++i) {
        if(ant == this.ants[i]){
            antID = i;
            break;
        }
    }
    if(antID != -1) {
        this.ants.splice(antID, 1);
    }else {
        console.log("ERROR FINDING ANT");
    }
};

GameServer.prototype.removeClient = function (client) {
    var clientID = -1;
    for(var i = 0; i < this.clients.length; ++i) {
        if(client == this.clients[i]){
            clientID = i;
            break;
        }
    }
    if(clientID != -1) {
        console.log("Player " + client.player.playerID + " disconnected...");
        this.clients.splice(clientID, 1);
    }else {
        console.log("ERROR DISCONNECTING CLIENT");
    }
};

GameServer.prototype.removeHill = function (hill) {
    var hillID = -1;
    for(var i = 0; i < this.hills.length; ++i) {
        if(hill == this.hills[i]){
            hillID = i;
            break;
        }
    }
    if(hillID != -1) {
        this.hills.splice(hillID, 1);
    }else {
        console.log("ERROR FINDING HILL");
    }
};



GameServer.prototype.spawnFood = function() {
    var f = new Entity.Food(this.getNextNodeId(), null, this.getRandomPosition(), this.config.foodMass, this);
    f.setColor(this.getRandomColor());

    this.addNode(f);
    this.currentFood++;
};



GameServer.prototype.updateAnts = function() {
    for (var i = 0; i < this.ants.length; i++) {
        this.ants[i].update();
    }
};

GameServer.prototype.updateClients = function() {
    for (var i = 0; i < this.clients.length; i++) {
        if (typeof this.clients[i] == "undefined" || this.clients[i].player.nick == undefined) {
            continue;
        }
        //console.log("Updating Client: " + this.clients[i].player.nick);
        this.clients[i].player.update();
    }
};
GameServer.prototype.updateHills = function() {
    for (var i = 0; i < this.hills.length; i++) {
        this.hills[i].update();
    }
};


//if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
WebSocket.prototype.sendPacket = function(packet) {
    this.send(JSON.stringify({
        msg: packet
    }));
    //this.readyState = WebSocket.CLOSED;
    //this.emit('close');
    //this.removeAllListeners();
};
