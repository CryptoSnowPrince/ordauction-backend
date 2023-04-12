const { getAddressInfo } = require('bitcoin-address-validation')
const db = require('../../db');
// const user = require('../../db/user');
// const info = require('../../db/info')
const user = db.User
const info = db.Info
const bitcoin = require('send-crypto')

const { SUCCESS, FAIL, getBalance, verifyMessage, IS_TESTNET } = require('../../utils');

module.exports = async (req_, res_) => {
    try {
        console.log("===== /api/users/setUserInfo");
        const ordWallet = req_.body.ordWallet
        const actionDate = req_.body.actionDate
        const plainText = req_.body.plainText
        const publicKey = req_.body.publicKey
        const signData = req_.body.signData

        console.log("ordWallet", ordWallet)
        console.log("actionDate", actionDate)
        console.log("plainText", plainText)
        console.log("publicKey", publicKey)
        console.log("signData", signData)

        if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !actionDate || !plainText || !publicKey || !signData) {
            console.log("null: ", (!ordWallet || !getAddressInfo(ordWallet).bech32 || !actionDate || !plainText || !publicKey || !signData));
            return res_.send({ result: false, status: FAIL, message: "Request params fail" });
        }

        // Verify Sign
        const verifySignRetVal = await verifyMessage(publicKey, plainText, signData)
        console.log("verifyMessage verifySignRetVal: ", verifySignRetVal);
        if (!verifySignRetVal) {
            return res_.send({ result: false, status: FAIL, message: "signature fail" });
        }

        const fetchItem = await user.findOne({ ordWallet: ordWallet });

        console.log("fetchItem: ", fetchItem);

        if (fetchItem) {
            const balance = await getBalance(fetchItem.btcAccount, 'main')
            return res_.send({
                result: {
                    ordWallet: ordWallet,
                    btcAccount: fetchItem.btcAccount,
                    btcBalance: balance
                }, status: SUCCESS, message: "Load success"
            });
            // return res_.send({ result: false, status: FAIL, message: "Already Exist" });
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
