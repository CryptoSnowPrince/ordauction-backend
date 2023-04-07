const { getAddressInfo } = require('bitcoin-address-validation')
const user = require('../../db/user');

const { SUCCESS, FAIL, getBalance } = require('../../utils');

module.exports = async (req_, res_) => {
    try {
        console.log("===== /api/users/getUserInfo", req_.body);
        const ordWallet = req_.body.ordWallet

        if (!ordWallet || !getAddressInfo(ordWallet).bech32) {
            console.log("null: ", !ordWallet);
            return res_.send({ result: false, status: FAIL, message: "Request params fail" });
        }

        const fetchItem = await user.findOne({ ordWallet: ordWallet });

        console.log("fetchItem: ", fetchItem);

        if (fetchItem) {
            const balance = await getBalance(fetchItem.btcAccount, 'main')
            console.log(`address is ${fetchItem.btcAccount}, balance is ${balance}`);
            return res_.send({
                result: {
                    ordWallet: fetchItem.ordWallet,
                    btcAccount: fetchItem.btcAccount,
                    btcBalance: balance
                }, status: SUCCESS, message: "Update Success"
            });
        } else {
            // need to register
            return res_.send({ result: false, status: FAIL, message: "Need to register" });
        }
    } catch (error) {
        return res_.send({ result: error, status: FAIL, message: "ordWallet getUserInfo err" });
    }
}
