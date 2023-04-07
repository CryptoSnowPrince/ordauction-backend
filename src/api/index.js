const express = require('express');
const users = require("./users");
const auction = require("./auction");

const router = express.Router();

router.use("/users", users);
router.use("/auction", auction);

module.exports = router;
