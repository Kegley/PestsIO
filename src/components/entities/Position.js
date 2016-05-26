function Position(x, y) {
    this.x = x;
    this.y = y;
}

module.exports = Position;

Position.prototype.setPosition = function(x, y) {
    if(x !== undefined) {
        this.x = x;
    }
    if(y !== undefined) {
        this.y = y;
    }
}

Position.prototype.getPosition = function() {
    return this;
}

Position.prototype.print = function() {
    return "x: " + this.pad(this.x, 5, " ") + ", y: " + this.pad(this.y, 5, " ");
}

Position.prototype.equals = function(position) {
    if(this.x == position.x && this.y == position.y) {
        return true;
    }
    return false;
}
