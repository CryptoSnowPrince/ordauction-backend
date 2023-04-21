const { getAddressInfo } = require('bitcoin-address-validation')
const db = require('../../db');
const auction = db.Auction;
// const auction = require("../../db/auction");
const {
  SUCCESS,
  FAIL,
  addNotify,
  AUCTION_CREATED,
  AUCTION_STARTED,
  AUCTION_ENDED,
  ADMIN,
  verifyMessage
} = require("../../utils");
const { EXPLORER_URL } = require('../../utils/config');

module.exports = async (req_, res_) => {
  try {
    // console.log("startAuction: ");

    const ordWallet = req_.body.ordWallet;
    const inscriptionID = req_.body.inscriptionID;
    const duration = req_.body.duration;
    const actionDate = req_.body.actionDate;
    const plainText = req_.body.plainText;
    const publicKey = req_.body.publicKey;
    const signData = req_.body.signData;

    // console.log("ordWallet: ", ordWallet, !ordWallet);
    // console.log("inscriptionID: ", inscriptionID, !inscriptionID);
    // console.log("duration: ", duration, !duration);
    // console.log("actionDate: ", actionDate, !actionDate);
    // console.log("plainText: ", plainText, !plainText);
    // console.log("publicKey: ", publicKey, !publicKey);
    // console.log("signData: ", signData, !signData);

    if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !duration || !inscriptionID || !actionDate || !plainText || !publicKey || !signData) {
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

    // verification admin
    if (ADMIN.indexOf(ordWallet) == -1 ) {
      return res_.send({ result: false, status: FAIL, message: "Not Admin" });
    }

    // Verify Current Auction State
    const fetchCurAuction = await auction.findOne({ state: AUCTION_STARTED })
    if (fetchCurAuction) {
      return res_.send({ result: false, status: FAIL, message: "Current Auction is not ended yet!" });
    }

    const fetchItem = await auction.findOne({ inscriptionID: inscriptionID, state: AUCTION_CREATED });
    if (fetchItem) {
      const endedItems = await auction.find({ state: AUCTION_ENDED })
      const cnt = endedItems.length;
      console.log(">>> AuctionId=", cnt + 1);
      const _updateResult = await auction.updateOne({
        inscriptionID: inscriptionID,
        state: AUCTION_CREATED
      }, {
        auctionID: (cnt + 1),
        state: AUCTION_STARTED,
        startDate: Date.now(),
        endDate: Date.now() + duration
      })

      if (!_updateResult) {
        return res_.send({ result: false, status: FAIL, message: "Update Error" });
      }

      await addNotify(ordWallet, {
        type: 0,
        title: "Auction Started!",
        link: `${EXPLORER_URL}/inscription/${inscriptionID}`,
        content: `Auction Started Successfully!`,
      });

      return res_.send({
        result: true,
        status: SUCCESS,
        message: "auction started",
      });
    } else {
      return res_.send({
        result: false,
        status: FAIL,
        message: "Can't find inscriptionID!",
      })
    }
  } catch (error) {
    console.log("auction create catch error: ", error);
    return res_.send({ result: false, status: FAIL, message: "Auction create Catch Error" });
  }
};
