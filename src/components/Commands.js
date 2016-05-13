function Commands() {
    this.list = {};
}

module.exports = Commands;

Commands.list = {
    lol: function() {
        console.log("LOL");
    }
};
