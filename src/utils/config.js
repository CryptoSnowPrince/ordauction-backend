const EXPORT_OBJECT = {};

const IS_TESTNET = false;
EXPORT_OBJECT.IS_TESTNET = IS_TESTNET;

const TESTNET_EXPLORER = "https://testnet.hariwhitedream.com";// "http://127.0.0.1:5000";
const MAINNET_EXPLORER = "https://ordinals.com";
const EXPLORER_URL = IS_TESTNET ? TESTNET_EXPLORER : MAINNET_EXPLORER;
EXPORT_OBJECT.EXPLORER_URL = EXPLORER_URL;

const TREASURY = IS_TESTNET ? "tb1q8zcn0ackfwq0jd7fjrxgc0k07x2sv3cf0lh4s6" : 'bc1q8zcn0ackfwq0jd7fjrxgc0k07x2sv3cf9evxtf';
const ADMIN = IS_TESTNET ? ["tb1q8zcn0ackfwq0jd7fjrxgc0k07x2sv3cf0lh4s6"] : ['bc1qakj552djms5p7gr3edp8we6rqaqqej970a2sal', 'bc1q8zcn0ackfwq0jd7fjrxgc0k07x2sv3cf9evxtf'];
EXPORT_OBJECT.ADMIN = ADMIN;
EXPORT_OBJECT.TREASURY = TREASURY;

const ORD_COMMAND_HEADER = IS_TESTNET ? "ord -t --cookie-file /work/bitcoin-node/testnet/testnet3/.cookie": "ord";
EXPORT_OBJECT.ORD_COMMAND_HEADER = ORD_COMMAND_HEADER;

const ORD_COMMAND = IS_TESTNET ? "ord -t --cookie-file /work/bitcoin-node/testnet/testnet3/.cookie wallet": "ord wallet";
EXPORT_OBJECT.ORD_COMMAND = ORD_COMMAND;

const INDEXING_TIME = IS_TESTNET ? 5000 : 300000;
EXPORT_OBJECT.INDEXING_TIME = INDEXING_TIME;

const TRANSFER_FEE = 5000;
EXPORT_OBJECT.TRANSFER_FEE = TRANSFER_FEE;

module.exports = EXPORT_OBJECT;