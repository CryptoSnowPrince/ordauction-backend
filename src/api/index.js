const express = require('express');
const users = require("./users");
const collection = require("./collection");

const router = express.Router();

router.use("/users", users);
router.use("/collection", collection);

module.exports = router;
