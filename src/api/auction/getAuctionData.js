const auction = require('../../db/auction');
const {
    SUCCESS,
    FAIL,
    AUCTION_STARTED
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getAuctionData: ", req_.query);

        const auctionID = req_.query.auctionID;

        if (auctionID === undefined || auctionID === null) {
            return res_.send({ result: false, status: FAIL, message: "param fail" });
        }

        // Cur Auction Info
        if (auctionID === -1) {
            const fetchCurAuction = await auction.findOne({ state: AUCTION_STARTED })
            return res_.send({ result: fetchCurAuction, status: SUCCESS, message: "Current Auction Success" });
        } else {
            const fetchCurAuction = await auction.findOne({ auctionID: auctionID })
            return res_.send({ result: fetchCurAuction, status: SUCCESS, message: "Get Auction Success" });
        }
    } catch (error) {
        console.log("get Auction error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get Auction fail" });
    }
}
