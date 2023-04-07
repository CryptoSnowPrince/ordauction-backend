const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        ordWallet: { type: String, default: "" },
        btcAccount: { type: String, default: "" }, // btc Account,
        active: { type: Boolean, default: true },
        network: { type: String, default: "mainnet"}
    }
)

module.exports = user = mongoose.model("user", userSchema)
