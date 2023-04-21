const { getAddressInfo } = require('bitcoin-address-validation')
const db = require('../../db');
const auction = db.Auction
// const auction = require("../../db/auction");
const awaitExec = require("util").promisify(require("child_process").exec);
const {
  SUCCESS,
  FAIL,
  addNotify,
  getDisplayString,
  timeEstimate,
  AUCTION_CREATED,
  ADMIN,
  verifyMessage
} = require("../../utils");
const { ORD_COMMAND, IS_TESTNET } = require('../../utils/config');

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    console.log("===== /api/auction/createAuction: ");
    const { file } = req_;
    filePath = file.path;
    const ordWallet = req_.body.ordWallet;
    const feeRate = req_.body.feeRate;
    const actionDate = req_.body.actionDate;
    const plainText = req_.body.plainText;
    const publicKey = req_.body.publicKey;
    const signData = req_.body.signData;

    // console.log("ordWallet: ", ordWallet, !ordWallet);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("actionDate: ", actionDate, !actionDate);
    // console.log("plainText: ", plainText, !plainText);
    // console.log("publicKey: ", publicKey, !publicKey);
    // console.log("signData: ", signData, !signData);

    if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !feeRate || !actionDate || !plainText || !publicKey || !signData) {
      console.log("request params fail");
      await awaitExec(`rm "${filePath}"`);
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
    if (ADMIN.indexOf(ordWallet) == -1) {
      return res_.send({ result: false, status: FAIL, message: "Not Admin" });
    }

    const estimateFees = await awaitExec(
      `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePath} --dry-run`
    );
    if (estimateFees.stderr) {
      await awaitExec(`rm "${filePath}"`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "inscribe estimateInscribe stderr",
      });
    }

    // createAuction
    const inscribeReturn = await awaitExec(
      `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePath}`
    );

    if (inscribeReturn.stderr) {
      console.log(
        `${ORD_COMMAND} inscriptions stderr: `,
        inscribeReturn.stderr
      );
      await awaitExec(`rm "${filePath}"`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "inscribe stderr",
      });
    }

    // Main case
    const btcTxHash = JSON.parse(inscribeReturn.stdout).commit;
    const inscriptionID = JSON.parse(inscribeReturn.stdout).inscription;
    console.log("ord inscribe btcTxHash stdout: ", btcTxHash);
    console.log("ord inscribe inscriptionID stdout: ", inscriptionID);

    const auctionItem = new auction({
      inscriptionID: inscriptionID,
      state: AUCTION_CREATED,
    });

    const savedItem = await auctionItem.save();
    console.log("new auctionItem object saved: ", savedItem);

    await addNotify(ordWallet, {
      type: 0,
      title: "Auction Create Success!",
      link: `https://mempool.space/${IS_TESTNET?"testnet/":""}tx/${btcTxHash}`,
      content: `Your inscription ${getDisplayString(
        inscriptionID
      )} will arrive to your wallet in ${timeEstimate(feeRate)}.`,
    });

    await awaitExec(`rm "${filePath}"`);
    return res_.send({
      result: true,
      status: SUCCESS,
      message: "auction created",
    });
  } catch (error) {
    console.log("auction create catch error: ", error);
    if (filePath) {
      try {
        await awaitExec(`rm "${filePath}"`);
      } catch (error) { }
    }
    return res_.send({ result: false, status: FAIL, message: "Catch Error" });
  }
};
