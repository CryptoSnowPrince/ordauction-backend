const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    auctionID: { type: Number, default: 0 },
    inscriptionID: { type: String, default: "" },
    bidCounts: { type: Number, default: 0 },
    status: { type: Number, default: 0 }, // 0: Not Started, 1: Active, 2: Pending, 3: Completed
    winner: { type: String, default: "" },
    startDate: { type: Date, default: Date.now() },
    endDate: { type: Date, default: Date.now() }
});

module.exports = auction = mongoose.model("auction", auctionSchema);