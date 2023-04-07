const collection = require('../../db/collections');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        const fetchItems = await collection.find({});
        if (!fetchItems) {
            return res_.send({ result: false, status: FAIL, message: "Collection is empty" });
        }
        // console.log("fetchItems=", fetchItems);
        return res_.send({ result: fetchItems, status: SUCCESS, message: "getCollection success" });
    } catch (error) {
        console.log("get collection error: ", error)
        return res_.send({ result: false, status: FAIL, message: "getCollection fail" });
    }
}
