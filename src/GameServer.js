var WebSocket = require('ws');
var http = require('http');
var fs = require("fs");

var Logs = require('./components/utils/Logs');
var Messages = require('./components/WSMessages');

var Position = require('./components/entities/Position');
var Player = require('./components/entities/Player');
var Food = require('./components/entities/Food');
var Node = require('./components/entities/Node');


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
    this.fullTick = 0; //movement tick
    this.tickMain = 0; //main tick
    this.tickSpawn = 0;//spawner tick

    //SERVER INFORMATION
    this.clients = [];
    this.hills = [];
    this.ants = [];
    this.foods = [];
    this.currentFoodMass = 0;


    //NODES/PLAYER INFORMATION
    this.lastPlayerId = 0;
    this.lastNodeId = 0;
    //config for GameServer - May differ per node
    this.config = {
        foodMaxSize: 100,
        mapBorderTop: 0,
        mapBorderBottom: 300,
        mapBorderLeft: 0,
        mapBorderRight: 300,
        mapCenterX: 0,
        mapCenterY: 0,
        maxFood: 1000,
        maxFoodMass: 10000,
        serverLogLevel: 2,
        serverPort: 443, // Server port
        spawnInterval: 250, // The interval between each food cell spawn in ticks (1 tick = 50 ms)

    }

    this.config.mapCenterY = Math.abs((this.config.mapBorderTop - this.config.mapBorderBottom) / 2);
    this.config.mapCenterX = Math.abs((this.config.mapBorderLeft - this.config.mapBorderRight) / 2);
    console.log(this.config)

    this.testNode = new Node(this, new Position(1, 1));
    this.testNode.setColor("#FFFFFF")
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
        this.spawnFood();
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
            setTimeout(this.spawnTick.bind(this), 0);
            setTimeout(this.updateFood.bind(this), 0);
            setTimeout(this.updateClients.bind(this), 0);
            setTimeout(this.updateAnts.bind(this), 0);
            setTimeout(this.updateHills.bind(this), 0)


            this.tickMain++;
            if (this.tickMain >= 4) { // 250 milliseconds
                // Update leaderboard with the gamemode's method
                //<<CODE HERE>>
                this.testNode.destination = new Position(this.testNode.position.x + 1, this.testNode.position.y + 1)
                //console.log(this.testNode.destination);
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



GameServer.prototype.moveClients = function() {
    //sort clients by num ants
    for (var i = 0; i < this.foods.length; i++) {
        this.foods[i].move();
    }
    this.testNode.move();

}


GameServer.prototype.spawnFood = function() {
    var i = this.config.maxFood - this.foods.length;
    console.log(i);
    i = Math.min(Math.floor(Math.random() * (i - 0 + 1)) + 0, 100);
    console.log(i);
    while(i > 0) {
        var f = new Food(this, this.getRandomPosition());
        this.currentFoodMass += f.size;
        --i;
    }
};

GameServer.prototype.spawnTick = function() {
    // Spawn food
    this.tickSpawn++;
    if (this.tickSpawn >= this.config.spawnInterval) {
        this.spawnFood(); // Spawn food
        this.tickSpawn = 0; // Reset
    }
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

GameServer.prototype.updateFood = function() {
    this.foods.sort(function(a, b) {
        return b.size - a.size;
    });
    for (var i = 0; i < this.foods.length; i++) {
        this.foods[i].update();
    }
};

GameServer.prototype.updateHills = function() {
    for (var i = 0; i < this.hills.length; i++) {
        this.hills[i].update();
    }
};


//if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
WebSocket.prototype.sendPacket = function(packet) {
    msg = packet.build();
    this.send(JSON.stringify({
        msg: msg
    }));
    //this.readyState = WebSocket.CLOSED;
    //this.emit('close');
    //this.removeAllListeners();
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++UTIL +++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

GameServer.prototype.addAnt = function (ant) {
    this.ants.push(ant);
}

GameServer.prototype.addHill = function (hill) {
    this.hills.push(hill)
}

GameServer.prototype.addFood = function (food) {
    this.foods.push(food);
}

GameServer.prototype.getClient = function (clientID) {
    for(var i = 0; i < this.clients.length; ++i) {
        if(clientID == this.clients[i].player.playerID){
            return this.clients[i];
        }
    }
    return null;
}


GameServer.prototype.getFood = function (foodID) {
    for(var i = 0; i < this.foods.length; ++i) {
        if(foodID == this.foods[i].nodeID){
            return this.foods[i];
        }
    }
    return null;
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



GameServer.prototype.getRandomPosition = function() {
    var xSum = this.config.mapBorderRight + this.config.mapBorderLeft;
    var ySum = this.config.mapBorderBottom + this.config.mapBorderTop;
    return new Position(
        Math.floor(Math.random() * xSum - this.config.mapBorderLeft),
        Math.floor(Math.random() * ySum - this.config.mapBorderTop)
    );
};

GameServer.prototype.getRandomSpawn = function(mass) {
    // Random and secure spawns for players and viruses
    var pos = this.getRandomPosition();
    var unsafe = false;

    //var unsafe = this.willCollide(mass, pos, mass == this.config.virusStartMass);
    var attempt = 1;

    // Prevent stack overflow by counting attempts
    while (true) {
        if (!unsafe || attempt >= 15) break;
        //pos = this.getRandomPosition();
        //unsafe = this.willCollide(mass, pos, mass == this.config.virusStartMass);
        unsafe = false;
        attempt++;
    }

    // If it reached attempt 15, warn the user
    if (attempt >= 14) {
        console.log("[Server] Entity could not find save Hill Location");
    }

    return pos;
};

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

GameServer.prototype.removeFood = function (food) {
    var foodID = -1;
    for(var i = 0; i < this.foods.length; ++i) {
        if(food == this.foods[i]){
            foodID = i;
            break;
        }
    }
    if(foodID != -1) {
        this.currentFoodMass -= this.foods[foodID].size;
        this.foods.splice(foodID, 1);
    }else {
        console.log("ERROR FINDING FOOD");
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


//***** MATH STUFF
GameServer.prototype.abs = function(x) { // Because Math.abs is slow
    return x < 0 ? -x : x;
};

GameServer.prototype.getAngle = function(x1, y1, x2, y2) {
    var deltaY = y1 - y2;
    var deltaX = x1 - x2;
    return Math.atan2(deltaX, deltaY);
};

GameServer.prototype.getDist = function(x1, y1, x2, y2) { // Use Pythagoras theorem
    var deltaX = this.abs(x1 - x2);
    var deltaY = this.abs(y1 - y2);
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};
