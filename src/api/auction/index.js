const express = require('express');
const router = express.Router();
const multer = require('multer');

const getBidHistory = require('./getBidHistory');
const bid = require("./bid");
const estimate = require('./estimate');
const createAuction = require('./createAuction');
const getEnableItems = require('./getEnableItems');
const startAuction = require('./startAuction');
const endAuction = require('./endAuction');
const getCurAuction = require('./getCurAuction');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, BASE_UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// getBidHistory
router.get('/getBidHistory', getBidHistory);

// bid
router.post('/bid', bid);

// estimate
router.post('/estimate', upload.single('file'), estimate);

// createAuction
router.post('/createAuction', upload.single('file'), createAuction);

// getEnableItems
router.post('/getEnableItems', getEnableItems);

// startAuction
router.post('/startAuction', startAuction);

// endAuction
router.post('/endAuction', endAuction);

// getCurAuction
router.post('/getCurAuction', getCurAuction);

module.exports = router;