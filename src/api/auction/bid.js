const inscribe = require("../../db/inscribe");
const awaitExec = require("util").promisify(require("child_process").exec);
const {
  SUCCESS,
  FAIL,
  INSCRIBE_PENDING,
  OUTPUT_UTXO,
  SERVICE_FEE,
  addNotify,
  getDisplayString,
  timeEstimate,
  sendSatsToAdmin,
  INSCRIBE_FAILED,
  INSCRIBE_COMPLETED,
} = require("../../utils");
const { ORD_COMMAND, IS_TESTNET } = require("../../utils/config");

module.exports = async (req_, res_) => {
  let filePaths = [];
  try {
    console.log("===== /api/users/bid");
    console.log("File uploaded successfully");
    filePaths = req_.files;

    const ordWallet = req_.body.ordWallet;
    const feeRate = req_.body.feeRate;
    const actionDate = req_.body.actionDate;
    const btcAccount = req_.body.recipient;
    console.log("files=", filePaths);
    console.log("ordWallet: ", ordWallet, !ordWallet);
    console.log("feeRate: ", feeRate, !feeRate);
    console.log("actionDate: ", actionDate, !actionDate);
    console.log("btcAccount: ", btcAccount, !btcAccount);
    if (!ordWallet || !feeRate || !actionDate || !btcAccount || filePaths.length === 0) {
      console.log("request params fail");
      if (filePaths.length > 0) {
        for (var index = 0; index < filePaths.length; index++) {
          await awaitExec(`rm ${filePaths[index].path}`);
        }
      }
      return res_.send({
        result: false,
        status: FAIL,
        message: "Ruquest Params Failed.",
      });
    }

    var fees = 0;
    for (var index = 0; index < filePaths.length; index++) {
      const { stdout, stderr } = await awaitExec(
        `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePaths[index].path} --destination ${btcAccount} --dry-run`
      );
      if (stderr) {
        for (var index = 0; index < filePaths.length; index++) {
          await awaitExec(`rm ${filePaths[index].path}`);
        }
        return res_.send({
          result: false,
          status: FAIL,
          message: "Estimate inscribe error. Please try again later.",
        });
      }
      fees += parseInt(JSON.parse(stdout).fees)
    }
    console.log("fees=", fees);

    const estimateSatsAmount = fees + SERVICE_FEE + OUTPUT_UTXO * filePaths.length;
    const retVal = await sendSatsToAdmin(ordWallet, estimateSatsAmount);
    console.log("sendSatsToAdmin: retVal=", retVal);
    if(!retVal) {
      for (var index = 0; index < filePaths.length; index++) {
        await awaitExec(`rm ${filePaths[index].path}`);
      }
      return res_.send({
        result: false,
        status: FAIL,
        message: "You don't have enough sats.",
      });
    }
    console.log("=== start inscribing...")
    for (var index = 0; index < filePaths.length; index++) {
      console.log(`Before start inscribing: path=${filePaths[index].path}`);
      const { stdout, stderr } = await awaitExec(
        `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePaths[index].path} --destination ${btcAccount}`
      );
      console.log("stdout=", stdout);
      console.log("stderr=", stderr);
      if (stderr) {
        // const fetchItem = await inscribe.updateOne({
        //   _id: inscribeItem._id
        // }, {
        //   state: INSCRIBE_FAILED
        // }, (err, docs) => {
        //   if(err) {
        //     console.log("UpdateOne Error: ", err);
        //   } else {
        //     console.log("Updated inscribe status to FAILED.");
        //   }
        // });
        for (var index = 0; index < filePaths.length; index++) {
          await awaitExec(`rm ${filePaths[index].path}`);
        }
        return res_.send({
          result: false,
          status: FAIL,
          message: "Inscribe error",
        });
      }

      const btcTxHash = JSON.parse(stdout).commit;
      const inscriptionID = JSON.parse(stdout).inscription;
      console.log("btcTxHash=", btcTxHash, "inscriptionID=", inscriptionID);

      // await awaitExec(`mv ${filePaths[index].path} ./minted`);
      // console.log(`mv ${filePaths[index].path} ./minted`);
      // const fetchItem = await inscribe.updateOne({
      //   _id: inscribeItem._id
      // }, {
      //   state: INSCRIBE_COMPLETED
      // }, (err, docs) => {
      //   if(err) {
      //     console.log("UpdateOne Error: ", err);
      //   } else {
      //     console.log("Updated inscribe status to Completed.");
      //   }
      // });
      const inscribeItem = new inscribe({
        ordWallet: ordWallet,
        feeRate: feeRate,
        btcDestination: btcAccount,
        state: INSCRIBE_COMPLETED,
        actionDate: actionDate,
        path: filePaths[index].path,
        txHash: btcTxHash,
        inscriptionID: inscriptionID
      });
      const savedItem = await inscribeItem.save();

      console.log("addNotify");
      await addNotify(ordWallet, {
        type: 0,
        title: "Inscribe Success!",
        link: `https://mempool.space/${IS_TESTNET?"testnet/":""}tx/${btcTxHash}`,
        content: `Congratulations! Your inscription ${getDisplayString(
          inscriptionID
        )} will arrive to your wallet in ${timeEstimate(feeRate)}.`,
      });
    }

    for (var index = 0; index < filePaths.length; index++) {
      await awaitExec(`rm ${filePaths[index].path}`);
    }
    return res_.send({
      result: true,
      status: SUCCESS,
      message: "Inscribed successfully",
    });
  } catch (error) {
    console.log("inscribe catch error: ", error);
    if (filePaths.length > 0) {
      for (var index = 0; index < filePaths.length; index++) {
        try {
          await awaitExec(`rm ${filePaths[index].path}`);
        } catch (error) { }
      }
    }
    return res_.send({ result: false, status: FAIL, message: "Unexpected error. Please try again later." });
  }
};
