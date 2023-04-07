const EXPORT_OBJECT = {};

const IS_TESTNET = true;
EXPORT_OBJECT.IS_TESTNET = IS_TESTNET;

const TESTNET_EXPLORER = "https://testnet.hariwhitedream.com";// "http://127.0.0.1:5000";
const MAINNET_EXPLORER = "https://ordinals.com";
const EXPLORER_URL = IS_TESTNET ? TESTNET_EXPLORER : MAINNET_EXPLORER;
EXPORT_OBJECT.EXPLORER_URL = EXPLORER_URL;

const TREASURY = IS_TESTNET ? "tb1qyje9f3h6gpz5mkwjzuj232uymk7de8hlvnnpt5" : 'bc1q5ukln268k5x37r9u978netsptp7f3vd3e5ay6q';
const ADMIN = IS_TESTNET ? "tb1qyje9f3h6gpz5mkwjzuj232uymk7de8hlvnnpt5" : 'bc1q5ukln268k5x37r9u978netsptp7f3vd3e5ay6q';
EXPORT_OBJECT.ADMIN = ADMIN;
EXPORT_OBJECT.TREASURY = TREASURY;

module.exports = EXPORT_OBJECT;