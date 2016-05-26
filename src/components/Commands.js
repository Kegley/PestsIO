function Commands() {
    this.list = {};
}

module.exports = Commands;

Commands.list = {
    lol: function() {
        console.log("LOL");
    },
    addfood: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log("[Console] Please specify a valid player ID!");
            return;
        }
        //get foodamt
        var amt = parseInt(split[2]);
        if (isNaN(amt)) {
            console.log("[Console] Please specify a valid food amount!");
            return;
        }
        var client = gameServer.getClient(id);
        if(client != null) {
            client.player.homeHill.addFood(amt);
        }

    },
    eat: function (gameServer, split) {
        var pID = parseInt(split[1]);
        if (isNaN(id)) {
            console.log("[Console] Please specify a valid player ID!");
            return;
        }
        //get foodID
        var foodID = parseInt(split[2]);
        if (isNaN(foodID)) {
            console.log("[Console] Please specify a valid food id!");
            return;
        }
        //food amt
        var amt = parseInt(split[3]);
        if (isNaN(amt)) {
            console.log("[Console] Please specify a valid food amount!");
            return;
        }
        var player = gameServer.getClient(pID).player
        if(player == null) {
            console.log("[Console] Player not found");
            return;
        }
        var homeHill = player.homeHill;
        var food = gameServer.getFood(foodID);
        if(food == null) {
            console.log("[Console] Food not found");
            return;
        }
        homeHill.addFood(food.eat(amt));

    },
    food: function(gameServer, split) {
        console.log(gameServer.foods.length);
        for(var i = 0; i < gameServer.foods.length; ++i){
            console.log(gameServer.foods[i].print());
        }
    },
    kick: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log("[Console] Please specify a valid player ID!");
            return;
        }
        var client = gameServer.getClient(id);
        if(client != null) {
            client.close();
        }
    },
    player: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log("[Console] Please specify a valid player ID!");
            return;
        }
    },
    players: function(gameServer, split) {
        console.log("Players: " + gameServer.clients.length);
        for(var i = 0; i < gameServer.clients.length; ++i){
            console.log(gameServer.clients[i].player.print());
        }
    },
    playerviewbox: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log("[Console] Please specify a valid player ID!");
            return;
        }
        var client = gameServer.getClient(id);
        if(client != null) {
            console.log(client.player.viewBox);
        }
    },
    reloadfood: function(gameServer, split) {
        gameServer.foods = [];
        gameServer.currentFoodMass = 0;
        gameServer.spawnFood();
    },
};
