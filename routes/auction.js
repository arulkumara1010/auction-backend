
const express = require("express");
const supabase = require("../config/supabase");
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ Start the Auction (Only if 10 Teams Assigned)
router.post("/start", async (req, res) => {
    const { data: teams, error } = await supabase
        .from("teams")
        .select("*")
        .not("owner_id", "is", null);

    if (error || teams.length < 10) {
        return res.status(400).json({ error: "Not enough teams assigned to start the auction" });
    }

    res.json({ message: "Auction started!" });
});

// ✅ Place a Bid (Protected)
router.post("/bid", authenticateUser, async (req, res) => {
    const { player_id, bid_amount } = req.body;
    const team_id = req.user.team_id; // Extract user's team

    if (!team_id) return res.status(400).json({ error: "User has no team assigned" });

    const { data: player, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", player_id)
        .single();

    if (playerError || player.sold) {
        return res.status(400).json({ error: "Player already sold or doesn't exist" });
    }

    // Assign player to team
    await supabase
        .from("players")
        .update({ sold: true, soldteam: team_id, soldprice: bid_amount })
        .eq("id", player_id);

    res.json({ message: "Bid successful, player assigned" });
});

module.exports = router;
