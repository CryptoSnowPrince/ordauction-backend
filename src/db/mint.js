const mongoose = require("mongoose");

const mintSchema = new mongoose.Schema({
    collectionId: {type: String, default: ""},
    uuid: {type: String, default: ""},
    mintCount: {type: Number, default: 1},
    mintIds: {type: String, default: ""},
    pending: {type: String, default: ""},
    startDate: {type: Date, default: Date.now()},
    inscriptionID: { type: String, default: "" },
    txHash: { type: String, default: "" }, // Bitcoin txHash
});

module.exports = mint = mongoose.model("mint", mintSchema);