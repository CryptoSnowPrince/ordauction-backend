const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        ordWallet: { type: String, default: "" },
        btcAccount: { type: String, default: "" }, // btc Account,
        btcBalance: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        network: { type: String, default: "mainnet"}
    }
)

module.exports = (mongoose) => {
    const user = mongoose.model("user", userSchema);
    return user;
}
