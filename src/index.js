// Imports
var Commands = require('./components/Commands');
var GameServer = require('./GameServer');

// Init variables
var showConsole = true;

// Start msg
console.log("[Game] PestsIO - Agar/SlitherIO inspired multiplayer game");

// Handle arguments
process.argv.forEach(function(val) {
    //Don't show console with --noconsole
    if (val == "--noconsole") {
        showConsole = false;
    }
});

// Run Ogar
var gameServer = new GameServer();
gameServer.start();
// Add command handler
gameServer.commands = Commands.list;
// Initialize the server console
if (showConsole) {
    var readline = require('readline');
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    setTimeout(prompt, 100);
}

// Console functions

function prompt() {
    in_.question(">", function(str) {
        parseCommands(str);
        //TODO: Make this async later
        return prompt(); // Too lazy to learn async
    });
}

function parseCommands(str) {
    // Log the string
    gameServer.log.onCommand(str);

    // Don't process ENTER
    if (str === '')
        return;

    // Splits the string
    var split = str.split(" ");

    // Process the first string value
    var first = split[0].toLowerCase();

    // Get command function
    var execute = gameServer.commands[first];
    if (typeof execute != 'undefined') {
        execute(gameServer, split);
    } else {
        console.log("[Console] Invalid Command!");
    }
}
