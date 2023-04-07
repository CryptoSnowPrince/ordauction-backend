const express = require('express');
const router = express.Router();

const getBidHistory = require('./getBidHistory');
const bid = require("./bid");
const createAuction = require('./createAuction');
const endAuction = require('./endAuction');

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

// createAuction
router.post('/createAuction', upload.array('files'), createAuction);

// endAuction
router.post('/endAuction', endAuction);

module.exports = router;