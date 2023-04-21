const db = require('../../db');
const auction = db.Auction;
// const auction = require("../../db/auction");
const {
    SUCCESS,
    FAIL,
    AUCTION_CREATED,
} = require("../../utils");
const { EXPLORER_URL } = require("../../utils/config");

module.exports = async (req_, res_) => {
    try {
        // console.log("getEnableItems: ");
        const fetchItems = await auction.find({ state: AUCTION_CREATED })
        if (fetchItems.length > 0) {
            const result = [];
            for(let i = 0;i<fetchItems.length;i++) {
                result[i] = {...fetchItems[i]._doc};
                if(fetchItems[i].inscriptionID){
                    result[i].imageUrl = `${EXPLORER_URL}/content/${fetchItems[i].inscriptionID}`;
                    result[i].link = `${EXPLORER_URL}/inscription/${fetchItems[i].inscriptionID}`;
                }
            }
            return res_.send({ result, status: SUCCESS, message: "Get Enable Items Sucess" });
        }

        return res_.send({ result: [], status: FAIL, message: "Enable Items Is Empty" });
    } catch (error) {
        console.log("get Enable Item catch error: ", error);
        return res_.send({ result: false, status: FAIL, message: "Catch Error" });
    }
};
