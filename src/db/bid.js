const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    inscriptionID: { type: String, default: "" },
    ordWallet: { type: String, default: "" },
    bidNumber: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    bidDate: { type: Date, default: Date.now() }
});

module.exports = bid = mongoose.model("bid", bidSchema);