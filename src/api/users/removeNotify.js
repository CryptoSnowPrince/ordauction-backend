const notify = require('../../db/notify');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("===== /api/users/removeNotify ");

        const ordWallet = req_.body.ordWallet;
        const removeAll = req_.body.removeAll;

        if (!ordWallet) {
            console.log("Request params failed");
            return res_.send({ result: false, status: FAIL, message: "Request params failed" });
        }

        if (removeAll) {
            const _updateResult = await notify.updateMany({
                ordWallet: ordWallet,
                active: true
            }, { active: false });
            if (!_updateResult) {
                console.log("Remove all notifications fail!");
                return res_.send({ status: FAIL, message: "Remove all notifications fail!" });
            }
            console.log("Remove all success");
            return res_.send({ status: SUCCESS, message: "Remove all success" });
        }
        // else {
        //     const _updateResult = await notify.updateOne({
        //         ordWallet: ordWallet,
        //         type: type,
        //         title: title,
        //         link: link,
        //         content: content,
        //         notifyDate: notifyDate,
        //         active: true
        //     }, { active: false });

        //     if (!_updateResult) {
        //         return res_.send({ status: FAIL, message: "remove one fail!" });
        //     }
        //     return res_.send({ status: SUCCESS, message: "remove one success" });
        // }
    } catch (error) {
        console.log('remove notify catch error: ', error)
        return res_.send({ status: FAIL, message: "Catch Error" });
    }
}
