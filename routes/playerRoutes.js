const express = require("express");
const { getPlayers } = require("../controllers/playerController");
const router = express.Router();

router.get("/", getPlayers);

module.exports = router;
