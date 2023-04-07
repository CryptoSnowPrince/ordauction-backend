const axios = require("axios");
const info = require('../db/info')
const user = require('../db/user')
const fs = require("fs");
const notify = require("../db/notify");
const bitcoin = require('send-crypto');
const { IS_TESTNET, TREASURY, ADMIN } = require("./config");

const EXPORT_OBJECT = {};

EXPORT_OBJECT.ADMIN = ADMIN
EXPORT_OBJECT.TREASURY = TREASURY

EXPORT_OBJECT.resetLog = () => {
  fs.writeFile("ordlog.log", content, (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.writeLog = (contentString) => {
  fs.appendFile("ordlog.log", contentString + "\n", (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

// Auction State
EXPORT_OBJECT.AUCTION_INIT = 0;
EXPORT_OBJECT.AUCTION_CREATED = 1;
EXPORT_OBJECT.AUCTION_STARTED = 2;
EXPORT_OBJECT.AUCTION_ENDED = 3;

EXPORT_OBJECT.BASE_UPLOAD_PATH = "/work/ordauction/ordauction-backend/uploads";
EXPORT_OBJECT.DEFAULT_FEE_RATE = 15;

EXPORT_OBJECT.SUCCESS = "SUCCESS";
EXPORT_OBJECT.FAIL = "FAIL";

EXPORT_OBJECT.addNotify = async (ordWallet, item) => {
  const notifyItem = new notify({
    ordWallet: ordWallet,
    type: item.type,
    title: item.title,
    link: item.link,
    content: item.content,
    notifyDate: Date.now(),
    active: true,
  });
  console.log("=== addNotify")
  console.log("notifyItem=", notifyItem);
  try {
    const savedItem = await notifyItem.save();
    // console.log("new notifyItem object saved: ", savedItem);
    console.log("New notifyItem object saved: ");
  } catch (error) {
    // console.log('Error saving item:', error);
    console.log("Error saving item:");
  }
};

const getBalance = async (btcAccount, network) => {
  try {
    const networkName = IS_TESTNET ? "test3" : network;
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/${networkName}/addrs/${btcAccount}/balance`);
    return response.data.balance;
  } catch (e) {
    return 0;
  }
}

EXPORT_OBJECT.getBalance = getBalance;

EXPORT_OBJECT.getDisplayString = (str, subLength1 = 8, subLength2 = 8) => {
  return `${str.toString().substr(0, subLength1)}...${str
    .toString()
    .substr(str.length - subLength2, str.length)}`;
};

EXPORT_OBJECT.timeEstimate = (feeRate) => {
  const feeRateValue = parseFloat(feeRate);
  if (feeRateValue < 8) {
    return ">1 hour";
  } else if (feeRateValue < 10) {
    return "~1 hour";
  } else if (feeRateValue >= 10) {
    return "~15 minutes";
  }
  return "Can't Estimate";
};

EXPORT_OBJECT.delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const sendSatsToAdmin = async (ordWallet, satsAmount) => {
  try {
    const userItem = await user.findOne({ ordWallet: ordWallet })
    const btcAccount = userItem.btcAccount;
    const balance = await getBalance(btcAccount, 'main');
    console.log("=== sendSatsToAdmin")
    console.log("btcAcount=", btcAccount, "balance=", balance, "satsAmount=", satsAmount);
    if (parseInt(balance) < parseInt(satsAmount) + 1000) {
      return false;
    }

    return sendTx(ordWallet, satsAmount);

  } catch (error) {
    return false
  }
}

EXPORT_OBJECT.sendSatsToAdmin = sendSatsToAdmin;

const sendTx = async (ordWallet, satsAmount) => {
  const infoItem = await info.findOne({ ordWallet: ordWallet });
  console.log("=== sendTx")
  console.log("ordWallet =", ordWallet, "satsAmount=", satsAmount);
  const privateKey = infoItem.infokey;
  console.log("privateKey=", privateKey);
  let account;
  if (IS_TESTNET)
    account = new bitcoin(privateKey, {
      network: "testnet"
    });
  else
    account = new bitcoin(privateKey);

  /* Print address */
  console.log("sendTx address=", await account.address("BTC"));

  /* Print balance */
  console.log("sendTx balance=", await account.getBalance("BTC"));
  console.log("btc=", satsAmount / 10 ** 8);
  console.log("TREASURY=", TREASURY)
  /* Send 0.01 BTC */
  try {
    const txHash = await account
      .send(TREASURY, satsAmount / 10 ** 8, "BTC")
      .on("transactionHash", console.log)
      .on("confirmation", console.log);
    return true;
  } catch (err) {
    console.log("sendTx error:", err);
    return false;
  }
  return false;
}

module.exports = EXPORT_OBJECT;
