function Position(x, y, direction) {
    console.log("Position Made");
    this.x = x;
    this.y = y;
    this.direction = direction;
}

module.exports = Position;

Position.prototype.setPosition = function(x, y, direction) {
    if(x !== undefined) {
        this.x = x;
    }
    if(y !== undefined) {
        this.y = y;
    }
    if(direction !== undefined) {
        this.direction = direction;
    }
}

Position.prototype.getPosition = function() {
    return {x: this.x, y: this.y, direction: this.direction};
}
