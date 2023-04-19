const { getAddressInfo } = require('bitcoin-address-validation')
const awaitExec = require("util").promisify(require("child_process").exec);
const { SUCCESS, FAIL } = require("../../utils");
const { ORD_COMMAND, TRANSFER_FEE } = require('../../utils/config');

module.exports = async (req_, res_) => {
  let filePath = null;
  try {
    console.log("===== api/auction/estimate: ");
    const { file } = req_;
    filePath = file.path;
    // console.log(">>> File uploaded successfully");

    const feeRate = req_.body.feeRate;
    const ordWallet = req_.body.ordWallet;

    // console.log("filePath:", filePath);
    // console.log("feeRate: ", feeRate, !feeRate);
    // console.log("ordWallet: ", ordWallet, !ordWallet);

    if (!feeRate || !ordWallet || !getAddressInfo(ordWallet).bech32) {
      console.log("request params fail");
      if (filePath) {
        await awaitExec(`rm ${filePath}`);
      }
      return res_.send({
        result: false,
        status: FAIL,
        message: "request params fail",
      });
    }
    const { stdout, stderr } = await awaitExec(
      `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePath} --dry-run`
    );
    if (stderr) {
      await awaitExec(`rm ${filePath}`);
      return res_.send({
        result: false,
        status: FAIL,
        message: "Estimate stderr",
      });
    }
    // console.log("ord wallet inscriptions stdout: ", stdout);
    await awaitExec(`rm ${filePath}`);
    const totalFee = JSON.parse(stdout).fees;
    console.log(">>> Estimate success: fee=", totalFee);
    return res_.send({
      result: totalFee + TRANSFER_FEE,
      status: SUCCESS,
      message: "Estimate success",
    });
  } catch (error) {
    console.log("Estimate catch error: ", error);
    if (filePath) {
      try {
        await awaitExec(`rm ${filePath}`);
      } catch (error) {}
    }
    return res_.send({
      result: false,
      status: FAIL,
      message: "Estimate Catch Error",
    });
  }
};
