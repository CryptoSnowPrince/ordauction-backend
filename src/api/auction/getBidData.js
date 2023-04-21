const db = require('../../db');
const auction = db.Auction;
const bid = db.Bid;
// const auction = require('../../db/auction');
// const bid = require('../../db/bid');
const {
    SUCCESS,
    FAIL
} = require('../../utils')

module.exports = async (req_, res_) => {
    try {
        // console.log("getBidData: ", req_.query);

        let auctionID = req_.query.auctionID;

        if (auctionID === undefined || auctionID === null) {
            return res_.send({ result: false, status: FAIL, message: "param fail" });
        }

        // Cur Auction Bid Info
        if (auctionID === -1) {
            const fetchCurAuction = await auction.findOne({ state: AUCTION_STARTED })
            auctionID = fetchCurAuction.auctionID;
        }
        const fetchCurBidData = await bid.find({ auctionID: auctionID }).sort({ bidDate: 'desc' }).limit(100);
        return res_.send({ result: fetchCurBidData, status: SUCCESS, message: "getBidData Success" });
    } catch (error) {
        console.log("getBidData error: ", error)
        return res_.send({ result: false, status: FAIL, message: "get getBidData fail" });
    }
}
