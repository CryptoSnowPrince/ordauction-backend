const {
    SUCCESS,
    FAIL,
    getBalance
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("===== /api/users/getBalance");
        const wallet = req_.body.wallet;
        console.log("wallet=", wallet)
        
        const _balance = await getBalance(wallet, "main");
        console.log("balance=", _balance);
        return res_.send({ result: _balance, status: SUCCESS, message: "getBalance" });
    } catch (error) {
        console.log("get balance error: ", error)
        return res_.send({ result: false, status: FAIL, message: "getWalletBalance error" });
    }
}
