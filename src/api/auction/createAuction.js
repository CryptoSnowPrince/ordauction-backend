const { getAddressInfo } = require('bitcoin-address-validation')
const auction = require("../../db/auction");
const awaitExec = require("util").promisify(require("child_process").exec);
const {
  SUCCESS,
  FAIL,
  addNotify,
  getDisplayString,
  timeEstimate,
  AUCTION_CREATED,
  ADMIN
} = require("../../utils");

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    // console.log("createAuction: ");
    const { file } = req_;
    filePath = file.path;
    // console.log(file);

    const ordWallet = req_.body.ordWallet;
    const feeRate = req_.body.feeRate;
    const actionDate = req_.body.actionDate;
    const signData = req_.body.signData;

    // console.log("ordWallet: ", ordWallet, !ordWallet);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("actionDate: ", actionDate, !actionDate);
    // console.log("signData: ", signData, !signData);

    if (!ordWallet || !getAddressInfo(ordWallet).bech32 || !feeRate || !actionDate || !signData) {
      console.log("request params fail");
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params fail",
      });
    }

    /////////////////////////////
    // verification sign
    // TODO
    /////////////////////////////

    // verification admin
    if (ordWallet !== ADMIN) {
      return res_.send({ result: false, status: FAIL, message: "Not Admin" });
    }

    const estimateFees = await awaitExec(
      `ord wallet inscribe --fee-rate ${feeRate} ${filePath} --dry-run`
    );
    if (estimateFees.stderr) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "inscribe estimateInscribe stderr",
      });
    }

    // createAuction
    const inscribeReturn = await awaitExec(
      `ord wallet inscribe --fee-rate ${feeRate} ${filePath}`
    );

    if (inscribeReturn.stderr) {
      console.log(
        "ord wallet inscriptions stderr: ",
        inscribeReturn.stderr
      );
      await awaitExec(`rm ${filePath}`);
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
      link: `https://mempool.space/tx/${btcTxHash}`,
      content: `Your inscription ${getDisplayString(
        inscriptionID
      )} will arrive to your wallet in ${timeEstimate(feeRate)}.`,
    });

    await awaitExec(`rm ${filePath}`);
    return res_.send({
      result: true,
      status: SUCCESS,
      message: "auction created",
    });
  } catch (error) {
    console.log("auction create catch error: ", error);
    if (filePath) {
      try {
        await awaitExec(`rm ${filePath}`);
      } catch (error) { }
    }
    return res_.send({ result: false, status: FAIL, message: "Catch Error" });
  }
};
