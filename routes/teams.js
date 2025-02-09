const express = require("express");
const supabase = require("../config/supabase");
const authenticateUser = require("../middleware/authMiddleware");
const { startAuction } = require("./auction");  // Import auction function

const router = express.Router();

// Get All Teams
router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// ✅ Assign Team to User (Protected)
router.post("/select", authenticateUser, async (req, res) => {
    const { team_id } = req.body;
    const user_id = req.user.id; // Extracted from JWT token

    try {
        // 🛑 Check if team is already taken
        const { data: team, error: teamError } = await supabase
            .from("teams")
            .select("owner_id")
            .eq("id", team_id)
            .single();

        if (teamError || team.owner_id) {
            return res.status(400).json({ error: "Team is already taken" });
        }

        // ✅ Assign team to user
        await supabase.from("teams").update({ owner_id: user_id }).eq("id", team_id);
        await supabase.from("users").update({ team_id }).eq("id", user_id);

        // ✅ Check how many teams have owners
        const { count, error: countError } = await supabase
            .from("teams")
            .select("owner_id", { count: "exact", head: true })
            .not("owner_id", "is", null);

        if (countError) {
            console.error("Error counting teams:", countError.message);
            return res.status(500).json({ error: "Failed to check teams" });
        }

        // 🎯 If all 10 teams have been assigned, start auction via auction.js
        startAuction(); // ✅ Call startAuction from auction.js

        res.json({ message: "Team assigned successfully" });

    } catch (error) {
        console.error("Error assigning team:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
