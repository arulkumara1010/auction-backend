const express = require("express");
const { getTeams, selectTeam } = require("../controllers/teamController");
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getTeams);
router.post("/select", authenticateUser, selectTeam);

module.exports = router;
