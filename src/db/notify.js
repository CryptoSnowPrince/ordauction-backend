const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
    {
        uuid: { type: String, default: "" }, // uuid
        type: { type: Number, default: -1 },
        title: { type: String, default: '' },
        link: { type: String, default: '' },
        content: { type: String, default: "" },
        notifyDate: { type: Date, default: Date.now() },
        active: { type: Boolean, default: false },
    }
)

module.exports = notify = mongoose.model("notify", notifySchema)
