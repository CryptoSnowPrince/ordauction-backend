const config = require('./config');
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = config.url;
db.User = require("./user")(mongoose);
db.Auction = require("./auction")(mongoose);
db.Bid = require("./bid")(mongoose);
db.Notify = require("./notify")(mongoose);
db.Info = require("./info")(mongoose);

module.exports = db;
