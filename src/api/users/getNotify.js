const { getAddressInfo } = require('bitcoin-address-validation')
const db = require('../../db');
const notify = db.Notify;
const user = db.User;
// const notify = require('../../db/notify');
// const user = require('../../db/user');
const {
    SUCCESS,
    FAIL,
    getBalance,
    addNotify
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getNotify: ", req_.query);

        const ordWallet = req_.query.ordWallet;

        if (!ordWallet || !getAddressInfo(ordWallet).bech32) {
            return res_.send({ result: false, status: FAIL, message: "getNotify ordWallet error" });
        }

        const fetchUserInfo = await user.findOne({ ordWallet: ordWallet, active: true });
        const balance = await getBalance(fetchUserInfo.btcAccount, 'main')
        // if (fetchUserInfo.btcBalance > parseInt(balance)) {
        //     console.log("addNotify");
        //     await addNotify(ordWallet, {
        //         type: 0,
        //         title: "Sats Consumed successfully!",
        //         link: `https://blockstream.info/address/${fetchUserInfo.btcAccount}`,
        //         content: `Consumed Sats Amount is ${fetchUserInfo.btcBalance - parseInt(balance)}`,
        //     });
        // } else if (fetchUserInfo.btcBalance < parseInt(balance)) {
        //     console.log("addNotify");
        //     await addNotify(ordWallet, {
        //         type: 0,
        //         title: "Sats Deposited successfully!",
        //         link: `https://blockstream.info/address/${fetchUserInfo.btcAccount}`,
        //         content: `Deposited Sats Amount is ${parseInt(balance) - fetchUserInfo.btcBalance}`,
        //     });
        // }

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
