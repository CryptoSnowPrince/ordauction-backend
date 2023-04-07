const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        uuid: { type: String, default: "" }, // uuid
        btcAccount: { type: String, default: "" }, // btc Account,
        firstLoginDate: { type: Date, default: Date.now() },
        lastUpdateDate: { type: Date, default: Date.now() },
        lastLoginDate: { type: Date, default: Date.now() },
        active: { type: Boolean, default: true },
        network: { type: String, default: "mainnet"}
    }
)

module.exports = user = mongoose.model("user", userSchema)
