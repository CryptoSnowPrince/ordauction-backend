const EXPORT_OBJECT = {};

const IS_TESTNET = true;
EXPORT_OBJECT.IS_TESTNET = IS_TESTNET;

const TESTNET_EXPLORER = "https://testnet.hariwhitedream.com";// "http://127.0.0.1:5000";
const MAINNET_EXPLORER = "https://ordinals.com";
const EXPLORER_URL = IS_TESTNET ? TESTNET_EXPLORER : MAINNET_EXPLORER;
EXPORT_OBJECT.EXPLORER_URL = EXPLORER_URL;

const ORD_COMMAND = IS_TESTNET ? "ord -t --cookie-file /work/blockchain-node/bitcoin/testnet/testnet3/.cookie wallet": "ord wallet";
EXPORT_OBJECT.ORD_COMMAND = ORD_COMMAND;

module.exports = EXPORT_OBJECT;