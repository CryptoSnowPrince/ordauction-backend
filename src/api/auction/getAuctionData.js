const db = require('../../db');
const auction = db.Auction;
const bid = db.Bid;
// const auction = require('../../db/auction');
const {
    SUCCESS,
    FAIL,
    AUCTION_STARTED,
    AUCTION_ENDED
} = require('../../utils');
const { EXPLORER_URL } = require('../../utils/config');

module.exports = async (req_, res_) => {
    try {
        // console.log("getAuctionData: ", req_.query);
        console.log("------- api/auction/getAuctionData");
        const auctionID = req_.body.auctionID;
        console.log("auctionId=", auctionID)
        if (auctionID === undefined || auctionID === null) {
            return res_.send({ result: false, status: FAIL, message: "param fail" });
        }
        // Cur Auction Info
        let fetchCurAuction;
        if (auctionID === -1 || auctionID === 0) {
            fetchCurAuction = await auction.findOne({ state: AUCTION_STARTED });
        } else {
            fetchCurAuction = await auction.findOne({ auctionID: auctionID, $or: [{state: AUCTION_STARTED}, {state: AUCTION_ENDED}] });
        }
        // console.log("fetchCurAuction=", fetchCurAuction);
        if(fetchCurAuction == null) {
            return res_.send({result: [], status: SUCCESS, message: "Not found auction data"});
        }
        //.sort({ bidDate: 'desc' }).limit(100)
        const fetchCurBidData = await bid.find({auctionID: fetchCurAuction.auctionID})
            .sort({bidDate: 'desc'}).limit(50);
        const _result = {...fetchCurAuction._doc, bids: fetchCurBidData};
        // result[i].imageUrl = `${EXPLORER_URL}/content/${fetchItems[i].inscriptionID}`;
        // result[i].link = `${EXPLORER_URL}/inscription/${fetchItems[i].inscriptionID}`;
        _result.imageUrl = `${EXPLORER_URL}/content/${_result.inscriptionID}`;
        _result.link = `${EXPLORER_URL}/inscription/${_result.inscriptionID}`;
        console.log("fetchCurAuction=", _result);
        return res_.send({ result: _result, status: SUCCESS, message: "Get Current auction info Successfully" });
    } catch (error) {
        console.log("get Auction error: ", error)
        return res_.send({ result: false, status: FAIL, message: "Get auction info fail" });
    }
}
