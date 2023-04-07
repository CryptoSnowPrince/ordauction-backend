const { getAddressInfo } = require('bitcoin-address-validation')
const auction = require("../../db/auction");
const awaitExec = require("util").promisify(require("child_process").exec);
const {
  SUCCESS,
  FAIL,
  addNotify,
  getDisplayString,
  timeEstimate,
} = require("../../utils");

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    // console.log("creatAuction: ");
    const { file } = req_;
    filePath = file.path;
    // console.log("File uploaded successfully");
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
    const findItem = await auction.findOne({ number: parseInt(number) });
    if (findItem) {
      console.log("double request to inscribe");
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "double request to inscribe",
      });
    }

    const inscribeItem = new inscribe({
      number: parseInt(number),
      ordWallet: ordWallet,
      btcDestination: btcDestination,
      satsAmount: satsAmount,
      token: InscribeInfo.token,
      tokenAmount: InscribeInfo.tokenAmount,
      state: InscribeInfo.state,
      actionDate: actionDate,
    });
    try {
      const savedItem = await inscribeItem.save();
      // console.log("new inscribeItem object saved: ", savedItem);
      console.log("new inscribeItem object saved: ");

      // Main case
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

      // Test case
      // const btcTxHash =
      //   "1cbad64220b73874d38cc222c156079bd30e063597a291b4470c0b099ee981a1";
      // const inscriptionID =
      //   "4d99e8f0a2efce1004317d5c86567b42e0ae804f137c809090a38474d085316ci0";

      console.log("ord inscribe btcTxHash stdout: ", btcTxHash);
      console.log("ord inscribe inscriptionID stdout: ", inscriptionID);

      const _updateResult = await inscribe.updateOne(
        { number: parseInt(number) },
        {
          inscriptionID: inscriptionID,
          state: INSCRIBE_COMPLETED,
          actionDate: Date.now(),
          txHash: btcTxHash,
        }
      );

      let message = "inscribe success";
      if (!_updateResult) {
        // console.log("updateOne fail!", _updateResult);
        message = "inscribe.updateOne err, need manual update";
        console.log("updateOne fail!");
      }

      await addNotify(ordWallet, {
        type: 0,
        title: "Inscribe Success!",
        link: `https://mempool.space/tx/${btcTxHash}`,
        content: `Congratulation! Your inscription ${getDisplayString(
          inscriptionID
        )} will arrive to your wallet in ${timeEstimate(feeRate)}.`,
      });

      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: true,
        status: SUCCESS,
        message: message,
      });
    } catch (error) {
      // console.log('Error saving inscribeItem:', error);
      console.log("Error saving inscribeItem:", error);
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "Error saving inscribeItem",
      });
    }

  } catch (error) {
    console.log("inscribe catch error: ", error);
    if (filePath) {
      try {
        await awaitExec(`rm ${filePath}`);
      } catch (error) { }
    }
    return res_.send({ result: false, status: FAIL, message: "Catch Error" });
  }
};
