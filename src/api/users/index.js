const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/work/ordinals/ordinalart-inscribe-backend/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const getUserInfo = require("./getUserInfo");

const getUserInscriptions = require("./getUserInscriptions");

const getNotify = require('./getNotify')
const removeNotify = require('./removeNotify')

const inscribe = require('./inscribe')
const estimateInscribe = require('./estimateInscribe')
const getUserInscribes = require('./getUserInscribes');
const getWalletBalance = require('./getWalletBalance');

// getUserInfo
router.post('/getUserInfo', getUserInfo);

// getUserInscriptions
router.post('/getUserInscriptions', getUserInscriptions);

// getNotify
router.get('/getNotify', getNotify);
router.post('/removeNotify', removeNotify);

// inscribe
router.post('/inscribe', upload.array('files'), inscribe);

// estimateInscribe
router.post('/estimateInscribe', upload.array('files'), estimateInscribe);

router.post('/getUserInscribes', getUserInscribes);

router.post('/getBalance', getWalletBalance);

module.exports = router;