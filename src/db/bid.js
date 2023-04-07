const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    inscriptionID: { type: String, default: "" },
    ordwallet: {type: String, default: ""},
    amount: {type: Number, default: 1},
    bidDate: {type: Date, default: Date.now()}
});

module.exports = bid = mongoose.model("bid", bidSchema);