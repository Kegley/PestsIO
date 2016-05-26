var Position = require('./Position');
var Node = require('./Node');


function Food(gameServer, location) {
    Node.apply(this, Array.prototype.slice.call([gameServer, location]));

    this.gameServer.addFood(this);

    this.decayTick = 0;
    this.decayRate = 1;



    //get value of food 50 max// for now
    this.value = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
    this.size = Math.floor(Math.random() * (10- 0 + 1)) + 0;
}

module.exports = Food;
Food.prototype = Object.create(Node.prototype);
Food.prototype.constructor = Food
//Food.prototype = new Node();

Food.prototype.update = function() {
    ++this.decayTick;
    if(this.decayTick > 25) {
        this.decay();
        this.decayTick = 0;
    }

    if(this.value <= 0 || this.size <= 0 || this.isCollidingWithBorder()) {
        this.remove(this);
        return;
    }

    this.collideWithFood();
}

Food.prototype.remove = function() {
    this.gameServer.removeFood(this);
}

Food.prototype.float = function() {
    //this.position is my origin
}


Food.prototype.decay = function() {
    willDecay = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    if(willDecay <= this.decayRate * (this.size/2)) {
        --this.value;
        --this.size;
        --this.gameServer.currentFoodMass;
    }
}

Food.prototype.eat = function(amt) {
    this.size = this.value;
    //subtract eat amount if theres atleast that amount
    if(this.value > amt) {
        this.value = this.value - amt;
        return amt;
    }else {
        //Don't let them eat more than is available
        amt = this.value;
        this.value = 0;
        return amt;
    }
}

Food.prototype.print = function() {
    return "Food: " + this.pad(this.nodeID, 6, " ") + " size: " + this.size +  " "+ this.position.print()
}

Food.prototype.collideWithFood = function(viewBox) {
    if(this.size >= this.gameServer.config.foodMaxSize) { return; }
    var foods = this.gameServer.foods;
    for(var i = 0; i < foods.length; ++i) {
        if(this == foods[i]) { continue;}
        // || this.inRange(foods[i].position.x, foods[i].position.y)
        if(this.collisionCheck(foods[i])){
            if(this.size >= foods[i].size){
                //This food is bigger, combine and grow, delete other food
                if(this.size + foods[i].size <= this.gameServer.config.foodMaxSize){
                    //This food can still grow
                    //WILL COLLIDE
                    var dist = this.gameServer.getDist(this.position.x, this.position.y, foods[i].position.x, foods[i].position.y);
                    if(dist < .01 && dist > -.01){
                        //consume only if the food is on top of this food
                        this.size += foods[i].size;
                        this.value += foods[i].value;
                        this.gameServer.currentFoodMass += foods[i].size;
                        foods[i].remove();


                    }else {
                        //MOVING TO THIS FOOD
                        foods[i].hasDestination = true;
                        foods[i].destination = new Position(this.position.x, this.position.y);
                        foods[i].color = this.color;
                    }
                }else {
                    //Can't be consumed by parent, start orbiting
                    //foods[i].destination = new Position(this.position.x, this.position.y);
                    //foods[i].isOrbiting = true;
                    //foods[i].orbitParent = this;\
                    foods[i].remove();

                }
            }
        }
    }
}



Food.prototype.inRange = function (x, y) {
    var range = Math.floor(this.size / 2) + 1;

    xLessRange = this.position.x - range;
    xMoreRange = this.position.x + range;
    yLessRange = this.position.y - range;
    yMoreRange = this.position.y + range;
    if(xLessRange < x && xMoreRange > x && yLessRange < y && yMoreRange > y) {
        console.log(this.nodeID + ": Range: " + range);
        return true;
    }
};
