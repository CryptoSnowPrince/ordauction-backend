const { getAddressInfo } = require('bitcoin-address-validation')
const awaitExec = require("util").promisify(require("child_process").exec);
const db = require('../../db');
const auction = db.Auction;
const bid = db.Bid;
// const auction = require("../../db/auction");
// const bid = require("../../db/bid");
const {
  SUCCESS,
  FAIL,
  addNotify,
  AUCTION_CREATED,
  AUCTION_STARTED,
  AUCTION_ENDED,
  sendSatsToAdmin,
  ADMIN,
  verifyMessage
} = require("../../utils");

module.exports = async (req_, res_) => {
  try {
    // console.log("endAuction: ");

    const ordWallet = req_.body.ordWallet;
    const auctionID = req_.body.auctionID;
    const feeRate = req_.body.feeRate;
    const plainText = req_.body.plainText;
    const publicKey = req_.body.publicKey;
    const signData = req_.body.signData;

    // console.log("ordWallet: ", ordWallet, !ordWallet);
    // console.log("auctionID: ", auctionID, !auctionID);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("plainText: ", plainText, !plainText);
    // console.log("publicKey: ", publicKey, !publicKey);
    // console.log("signData: ", signData, !signData);

    if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !auctionID || !feeRate || !plainText || !publicKey || !signData) {
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
    if (ordWallet !== ADMIN) {
      return res_.send({ result: false, status: FAIL, message: "Not Admin" });
    }

    const fetchCurAuction = await auction.findOne({ auctionID: auctionID, state: AUCTION_STARTED })
    if (!fetchCurAuction) {
      return res_.send({ result: false, status: FAIL, message: "There is no Auction to end!" });
    }

    const winnerItem = await bid.findOne({ auctionID: auctionID, bidNumber: fetchCurAuction.bidCounts })

    // Send SatsAmounts to Admin
    const retVal = await sendSatsToAdmin(winnerItem.ordWallet, winnerItem.amount);
    console.log("sendSatsToAdmin: retVal=", retVal);
    if (!retVal) {
      return res_.send({
        result: false,
        status: FAIL,
        message: "sendSatsToAdmin error",
      });
    }

    // Send Inscription to Winner
    const inscribeReturn = await awaitExec(
      `ord wallet send --fee-rate ${feeRate} ${winnerItem.ordWallet} ${fetchCurAuction.inscriptionID}`
    );

    if (inscribeReturn.stderr) {
      console.log(
        "ord wallet send stderr: ",
        inscribeReturn.stderr
      );
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "send stderr",
      });
    }

    const _updateResult = await auction.updateOne({
      auctionID: auctionID,
      state: AUCTION_STARTED
    }, {
      state: AUCTION_ENDED,
      winnerOrdWallet: winnerItem.ordWallet,
      amount: winnerItem.amount,
      endDate: Date.now()
    })

    if (!_updateResult) {
      return res_.send({ result: false, status: FAIL, message: "Update Error" });
    }

    const btcTxHash = inscribeReturn.stdout;
    console.log("ord send btcTxHash stdout: ", btcTxHash);

    await addNotify(ordWallet, {
      type: 0,
      title: "Auction Ended!",
      link: `https://mempool.space/tx/${btcTxHash}`,
      content: `Winner is ${winnerItem.ordWallet}!`,
    });

    return res_.send({
      result: true,
      status: SUCCESS,
      message: "auction ended",
    });
  } catch (error) {
    console.log("auction ended catch error: ", error);
    return res_.send({ result: false, status: FAIL, message: "Catch Error" });
  }
};
