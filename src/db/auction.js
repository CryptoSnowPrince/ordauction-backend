const mongoose = require("mongoose");

// Auction State
// AUCTION_INIT = 0;
// AUCTION_CREATED = 1;
// AUCTION_STARTED = 2;
// AUCTION_ENDED = 3;

const auctionSchema = new mongoose.Schema({
    auctionID: { type: Number, default: 0 },
    inscriptionID: { type: String, default: "" },
    bidCounts: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
    winnerOrdWallet: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now() },
    endDate: { type: Date, default: Date.now() }
});

module.exports = auction = mongoose.model("auction", auctionSchema);