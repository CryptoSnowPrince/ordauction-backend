const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
    {
        ordWallet: { type: String, default: "" },
        type: { type: Number, default: -1 },
        title: { type: String, default: '' },
        link: { type: String, default: '' },
        content: { type: String, default: "" },
        notifyDate: { type: Date, default: Date.now() },
        active: { type: Boolean, default: false },
    }
)

module.exports = (mongoose) => {
    const notify = mongoose.model("notify", notifySchema);
    return notify;
}
