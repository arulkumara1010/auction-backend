const express = require("express");
const { startAuction } = require("../controllers/auctionController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/start", authenticateUser, async (req, res) => {
  try {
    await startAuction();
    res.json({ message: "Auction started successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to start auction" });
  }
});

module.exports = router;
