const mongoose = require("mongoose");

const collectionsSchema = new mongoose.Schema({
    name: { type: String, default: "New Collection"},
    collectionId: { type: Number, default: 0},
    totalCount: { type: Number, default: 0 },
    mintedCount: { type: Number, default: 0 },
    mintPrice: {type: Number, default: "0.0015"},
    url: { type: String, default: ""},
    ext: { type: String, default: ".png"}
    ///// Add more collection info
});

module.exports = collections = mongoose.model("collections", collectionsSchema);