const notify = require('../../db/notify');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getNotify: ", req_.query);

        const ordWallet = req_.query.ordWallet;

        // console.log("ordWallet: ", ordWallet);

        if (!ordWallet) {
            return res_.send({ result: false, status: FAIL, message: "getNotify ordWallet error" });
        }

        const fetchItems = await notify.find({ ordWallet: ordWallet, active: true }).sort({ notifyDate: 'desc' }).limit(10);
        if (!fetchItems) {
            return res_.send({ result: false, status: FAIL, message: "getNotify field is empty" });
        }
        return res_.send({ result: fetchItems, status: SUCCESS, message: "get getNotify success" });
    } catch (error) {
        console.log("get getNotify error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get getNotify fail" });
    }
}
