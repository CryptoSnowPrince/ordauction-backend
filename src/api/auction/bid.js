const { getAddressInfo } = require('bitcoin-address-validation')
const db = require('../../db');
const auction = db.Auction;
const bid = db.Bid;
// const auction = require("../../db/auction");
// const bid = require('../../db/bid');
const {
  SUCCESS,
  FAIL,
  addNotify,
  AUCTION_STARTED,
  verifyMessage
} = require("../../utils");
const { EXPLORER_URL } = require('../../utils/config');

module.exports = async (req_, res_) => {
  try {
    // console.log("bid: ");

    const auctionID = req_.body.auctionID;
    const ordWallet = req_.body.ordWallet;
    const amount = req_.body.amount;
    const actionDate = req_.body.actionDate;
    const plainText = req_.body.plainText;
    const publicKey = req_.body.publicKey;
    const signData = req_.body.signData;

    // console.log("auctionID: ", auctionID, !auctionID);
    // console.log("ordWallet: ", ordWallet, !ordWallet);
    // console.log("amount: ", amount, !amount);
    // console.log("actionDate: ", actionDate, !actionDate);
    // console.log("plainText: ", plainText, !plainText);
    // console.log("publicKey: ", publicKey, !publicKey);
    // console.log("signData: ", signData, !signData);

    if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !amount || !auctionID || !actionDate || !plainText || !publicKey || !signData) {
      console.log("request params fail");
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params fail",
      });
    }

    // Verify Sign
    const verifySignRetVal = await verifyMessage(publicKey, plainText, signData)
    console.log("verifyMessage verifySignRetVal: ", verifySignRetVal);
    if (!verifySignRetVal) {
      return res_.send({ result: false, status: FAIL, message: "signature fail" });
    }

    const fetchCurAuction = await auction.findOne({ auctionID: auctionID, state: AUCTION_STARTED })
    if (!fetchCurAuction) {
      return res_.send({ result: false, status: FAIL, message: "That Auction is not exist!" });
    }
    if (fetchCurAuction.endDate < Date.now()) {
      return res_.send({ result: false, status: FAIL, message: "That Auction is time over!" });
    }
    if (fetchCurAuction.bidCounts !== 0) {
      const lastBid = await bid.findOne({
        auctionID: auctionID,
        inscriptionID: fetchCurAuction.inscriptionID,
        bidNumber: fetchCurAuction.bidCounts
      })
      if (!lastBid) {
        return res_.send({ result: false, status: FAIL, message: "Can't find last bid!" });
      }
      console.log('lastBid=', lastBid);
      console.log("actionDate=", actionDate)
      if (lastBid.bidDate > actionDate) {
        return res_.send({ result: false, status: FAIL, message: "You are late to bid, please bid again!" });
      }
      if (lastBid.amount > amount) {
        return res_.send({
          result: false,
          status: FAIL,
          message: "You bid amount is less than last bid, pleaes bid with more bitcoin!"
        });
      }
    }

    const bidItem = new bid(
      {
        auctionID: auctionID,
        inscriptionID: fetchCurAuction.inscriptionID,
        ordWallet: ordWallet,
        bidNumber: (fetchCurAuction.bidCounts + 1),
        amount: amount,
        bidDate: Date.now()
      }
    )
    console.log("bitItem=", bidItem);
    const _saveResult = await bidItem.save()
    console.log("_saveResult=", _saveResult);
    if (!_saveResult) {
      return res_.send({ result: false, status: FAIL, message: "New Bid Save Err" });
    }

    const _updateResult = await auction.updateOne({
      auctionID: auctionID,
      inscriptionID: fetchCurAuction.inscriptionID,
      state: AUCTION_STARTED
    }, {
      bidCounts: (fetchCurAuction.bidCounts + 1),
      amount: amount
    });

    if (!_updateResult) {
      return res_.send({ result: false, status: FAIL, message: "Update Auction State Err" });
    }

    await addNotify(ordWallet, {
      type: 0,
      title: "New Bid!",
      link: `${EXPLORER_URL}/inscription/${fetchCurAuction.inscriptionID}`,
      content: `New Bid Placed!`,
    });

    return res_.send({ result: true, status: SUCCESS, message: "New Bid Placed!" });
  } catch (error) {
    console.log("auction create catch error: ", error);
    return res_.send({ result: false, status: FAIL, message: "Catch Error" });
  }
};
