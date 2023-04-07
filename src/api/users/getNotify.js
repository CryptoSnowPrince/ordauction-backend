const notify = require('../../db/notify');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getNotify: ", req_.query);

        const uuid = req_.query.uuid;

        // console.log("uuid: ", uuid);

        if (!uuid) {
            return res_.send({ result: false, status: FAIL, message: "getNotify uuid error" });
        }

        const fetchItems = await notify.find({ uuid: uuid, active: true }).sort({ notifyDate: 'desc' }).limit(10);
        if (!fetchItems) {
            return res_.send({ result: false, status: FAIL, message: "getNotify field is empty" });
        }
        return res_.send({ result: fetchItems, status: SUCCESS, message: "get getNotify success" });
    } catch (error) {
        console.log("get getNotify error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get getNotify fail" });
    }
}
