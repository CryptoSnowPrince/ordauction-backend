const user = require('../../db/user');
const info = require('../../db/info')
const bitcoin = require('send-crypto')
const ecc = require('tiny-secp256k1')
const { ECPairFactory } = require('ecpair')

const { SUCCESS, FAIL, getBalance } = require('../../utils');
const { IS_TESTNET } = require('../../utils/config');
const ECPair = ECPairFactory(ecc);

module.exports = async (req_, res_) => {
    console.log("===== /api/users/getUserInfo");
    console.log("getUserInfo: ", req_.body);
    const ordWallet = req_.body.ordWallet
    const actionDate = req_.body.actionDate

    console.log("ordWallet", ordWallet)
    console.log("actionDate", actionDate)

    if (!ordWallet || !actionDate) {
        console.log("null: ", (!ordWallet || !validate(ordWallet) || !actionDate));
        return res_.send({ result: false, status: FAIL, message: "Request params fail" });
    }

    const fetchItem = await user.findOne({ ordWallet: ordWallet });

    console.log("fetchItem: ", fetchItem);
    
    // const fetchInfoItem = await info.findOne({ordWallet});
    // console.log("fetchInfoItem:", fetchInfoItem)
    // const _privateKey = fetchInfoItem.infokey;
    // const _account = new bitcoin(_privateKey, {network: "testnet"});
    // console.log("my address=", await _account.address("BTC"));

    if (fetchItem) {
        if (actionDate > fetchItem.lastUpdateDate) {
            // update profile
            console.log("update user profile: ");
            const _updateResult = await user.updateOne({ ordWallet: ordWallet }, {
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now()
            });

            if (!_updateResult) {
                console.log("updateOne fail!", _updateResult);
                return res_.send({ result: false, status: FAIL, message: "Update Fail" });
            }
            const balance = await getBalance(fetchItem.btcAccount, 'main')
            console.log(`address is ${fetchItem.btcAccount}, balance is ${balance}`);
            return res_.send({ result: {
                ordWallet: fetchItem.ordWallet,
                btcAccount: fetchItem.btcAccount,
                firstLoginDate: fetchItem.firstLoginDate,
                lastUpdateDate: fetchItem.lastUpdateDate,
                lastLoginDate: fetchItem.lastLoginDate,
                balance: balance
            }, status: SUCCESS, message: "Update Success" });
        }

        return res_.send({ result: false, status: FAIL, message: "Valid Timestamp" });
    } else {
        // register profile
        try {
            const privateKey = process.env.PRIVATE_KEY || bitcoin.newPrivateKey();
            console.log("=================== Register Profile")
            console.log("getUserInfo, privateKey = ", privateKey)
            let account = IS_TESTNET ? new bitcoin(privateKey, {network: "testnet"}) : new bitcoin(privateKey);
            const address = await account.address("BTC");
            console.log("account=", account);
            console.log("add new address: ", address);

            const userItem = new user({
                ordWallet: ordWallet,
                btcAccount: address,
                firstLoginDate: Date.now(),
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now(),
                network: IS_TESTNET ? "testnet" : "mainnet"
            })

            const infoItem = new info({
                ordWallet: ordWallet,
                infokey: privateKey,
                firstLoginDate: Date.now(),
                active: true,
                network: IS_TESTNET ? "testnet" : "mainnet"
            })
            console.log("userItem: ", userItem);
            console.log("infoItem: ", infoItem);
            console.log("keyPair: ", account.keyPair);
            console.log("privateKey: ", privateKey);
            try {
                const infoSavedItem = await infoItem.save();
                const savedItem = await userItem.save();
                console.log(`address is ${savedItem.btcAccount}`);
                // console.log("save savedItem: ", savedItem);
                console.log("save savedItem: ");
                const balance = await getBalance(savedItem.btcAccount, 'main')
                console.log(`address is ${savedItem.btcAccount}, balance is ${balance}`);
                return res_.send({ result: {
                    ordWallet: savedItem.ordWallet,
                    btcAccount: savedItem.btcAccount,
                    firstLoginDate: savedItem.firstLoginDate,
                    lastUpdateDate: savedItem.lastUpdateDate,
                    lastLoginDate: savedItem.lastLoginDate,
                    balance: balance
                }, status: SUCCESS, message: "Create Success" });
            } catch (error) {
                console.log('Error saving item:', error);
                return res_.send({ result: false, status: FAIL, message: "Error saving item" });
            }
        } catch (error) {
            console.log(`ordWallet create err: ${error}`);
            return res_.send({ result: error, status: FAIL, message: "ordWallet create err" });
        }
    }
}
