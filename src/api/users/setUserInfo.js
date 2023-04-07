const { getAddressInfo } = require('bitcoin-address-validation')
const user = require('../../db/user');
const info = require('../../db/info')
const bitcoin = require('send-crypto')

const { SUCCESS, FAIL, getBalance } = require('../../utils');
const { IS_TESTNET } = require('../../utils/config');

module.exports = async (req_, res_) => {
    try {

        console.log("===== /api/users/setUserInfo", req_.body);
        const ordWallet = req_.body.ordWallet
        const signData = req_.body.actionDate
        const publicKey = req_.body.actionDate

        console.log("ordWallet", ordWallet)
        console.log("actionDate", actionDate)

        if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !actionDate || !signData || !publicKey) {
            console.log("null: ", (!ordWallet || !getAddressInfo(ordWallet).bech32 || !actionDate || !signData || !publicKey));
            return res_.send({ result: false, status: FAIL, message: "Request params fail" });
        }

        /////////////////////
        // Verify Sign
        // TODO
        /////////////////////

        const fetchItem = await user.findOne({ ordWallet: ordWallet });

        console.log("fetchItem: ", fetchItem);

        if (fetchItem) {
            return res_.send({ result: false, status: FAIL, message: "Already Exist" });
        } else {
            // register profile
            // console.log("=================== Register Profile")
            const privateKey = process.env.PRIVATE_KEY || bitcoin.newPrivateKey();
            // console.log("getUserInfo, privateKey = ", privateKey)
            let account = IS_TESTNET ? new bitcoin(privateKey, { network: "testnet" }) : new bitcoin(privateKey);
            const address = await account.address("BTC");
            const balance = await getBalance(address, 'main')
            console.log("account=", account);
            console.log("add new address: ", address);

            const userItem = new user({
                ordWallet: ordWallet,
                btcAccount: address,
                btcBalance: balance,
                network: IS_TESTNET ? "testnet" : "mainnet"
            })

            const infoItem = new info({
                ordWallet: ordWallet,
                infokey: privateKey,
                network: IS_TESTNET ? "testnet" : "mainnet"
            })

            const infoSavedItem = await infoItem.save();
            // console.log("save infoSavedItem: ", infoSavedItem);
            const savedItem = await userItem.save();
            // console.log(`address is ${savedItem.btcAccount}`);
            // console.log("save savedItem: ", savedItem);
            console.log(`address is ${savedItem.btcAccount}, balance is ${balance}`);
            return res_.send({
                result: {
                    ordWallet: savedItem.ordWallet,
                    btcAccount: savedItem.btcAccount,
                    btcBalance: balance
                }, status: SUCCESS, message: "Create Success"
            });
        }
    } catch (error) {
        return res_.send({ result: error, status: FAIL, message: "setUserInfo err" });
    }
}
