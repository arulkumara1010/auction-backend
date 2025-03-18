const express = require("express");
const {
  getPlayers,
  getUnsoldPlayersController,
  getPlayerByIdController,
  getPlayersBoughtController,
  getPlayersBoughtByTeamController,
} = require("../controllers/playerController");

const router = express.Router();

// Fetch all players
router.get("/", getPlayers);

// Fetch all unsold players
router.get("/unsold", getUnsoldPlayersController);

// Fetch all bought players
router.get("/bought", getPlayersBoughtController);

// Fetch players bought by team ID
router.get("/bought/:team_id", getPlayersBoughtByTeamController);

// Fetch a specific player by ID
router.get("/:player_id", getPlayerByIdController);

module.exports = router;
