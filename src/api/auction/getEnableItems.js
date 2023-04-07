const auction = require("../../db/auction");
const {
    SUCCESS,
    FAIL,
    AUCTION_CREATED,
} = require("../../utils");

module.exports = async (req_, res_) => {
    try {
        // console.log("getEnableItems: ");
        const fetchItems = await auction.find({ state: AUCTION_CREATED })
        if (fetchItems.length > 0) {
            return res_.send({ result: fetchItems, status: SUCCESS, message: "Get Enable Items Sucess" });
        }

        return res_.send({ result: [], status: FAIL, message: "Enable Items Is Empty" });
    } catch (error) {
        console.log("get Enable Item catch error: ", error);
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
};
