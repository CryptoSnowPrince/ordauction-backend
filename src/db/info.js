const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema(
    {
        uuid: { type: String, default: "" }, // uuid
        infokey: { type: String, default: "" }, // info,
        firstLoginDate: { type: Date, default: Date.now() },
        active: { type: Boolean, default: true },
        network: { type: String, default: "mainnet"}
    }
)

module.exports = info = mongoose.model("info", infoSchema)
