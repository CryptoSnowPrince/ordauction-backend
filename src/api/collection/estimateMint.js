const collectionDb = require("../../db/collections");
const awaitExec = require("util").promisify(require("child_process").exec);
const { SUCCESS, FAIL, BASE_UPLOAD_PATH } = require("../../utils");
const { ORD_COMMAND } = require("../../utils/config");

module.exports = async (req_, res_) => {
  let filePaths = [];
  try {
    console.log("===== /api/collection/estimateMint: ");
    const collectionId = req_.body.collectionId;
    const feeRate = req_.body.feeRate;
    const mintCount = req_.body.mintCount;
    const btcAccount = req_.body.btcAccount;

    console.log("feeRate: ", feeRate, !feeRate);
    console.log("btcAccount: ", btcAccount, !btcAccount);

    if (!collectionId || !feeRate || !btcAccount) {
      console.log("request params fail");
      return res_.send({
        result: false,
        status: FAIL,
        message: "Request params fail",
      });
    }
    const collectionInfo = await collectionDb.findOne({collectionId});
    if(collectionInfo === null) {
        return res_.send({
            result: false,
            staus: FAIL,
            message: "Collection not found."
        });
    }
    const filePaths = [];
    const mintIds = [];
    for (let i = 0; i < mintCount; i++) {
        filePaths[i] = `${BASE_UPLOAD_PATH}${collectionInfo.url}/${collectionInfo.mintedCount + i + 1}${collectionInfo.ext}`;
        mintIds[i] = collectionInfo.mintedCount + i + 1;
    }

    var totalFees = 0;
    for (var i = 0; i < mintCount; i++) {
    
        const { stdout, stderr } = await awaitExec(
            `${ORD_COMMAND} inscribe --fee-rate ${feeRate} ${filePaths[i]} --destination ${btcAccount} --dry-run`
        );
        console.log("stdout=", stdout)
        if (stderr) {
            return res_.send({
              result: stderr,
              status: FAIL,
              message: "estimateMint stderr",
            });
        }
        totalFees += parseInt(JSON.parse(stdout).fees)
    }

    return res_.send({
      result: totalFees,
      status: SUCCESS,
      message: "estimateMint success",
    });
  } catch (error) {
    console.log("estimateMint catch error : ", error);
    return res_.send({
      result: false,
      status: FAIL,
      message: "estimateMint Catch Error",
    });
  }
};
