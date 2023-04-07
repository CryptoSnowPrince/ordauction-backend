const express = require('express');
const router = express.Router();

const getUserInfo = require("./getUserInfo");
const getNotify = require('./getNotify')
const removeNotify = require('./removeNotify')

// getUserInfo
router.post('/getUserInfo', getUserInfo);

// getNotify
router.get('/getNotify', getNotify);

// removeNotify
router.post('/removeNotify', removeNotify);

module.exports = router;