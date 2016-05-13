var WebSocket = require('ws');
var http = require('http');
var fs = require("fs");

var Logs = require('./components/utils/Logs');

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

    //config for GameServer - May differ per node
    this.config = {
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
            this.socket.sendPacket = function() {
                return;
            }; // Clear function so no packets are sent
        }

        ws.remoteAddress = ws._socket.remoteAddress;
        ws.remotePort = ws._socket.remotePort;
        this.log.onConnect(ws.remoteAddress); // Log connections

        //ws.playerTracker = new PlayerTracker(this, ws);
        //ws.packetHandler = new PacketHandler(this, ws);

        //HANDLE MESSAGES HERE
        //ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

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
        //setTimeout(this.moveTick.bind(this), 0);

        if (this.fullTick >= 2) {
            // Loop main functions
            //setTimeout(this.spawnTick.bind(this), 0);
            //setTimeout(this.gamemodeTick.bind(this), 0);
            //setTimeout(this.cellUpdateTick.bind(this), 0);

            // Update the client's maps
            //this.updateClients();

            // Update cells/leaderboard loop
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
