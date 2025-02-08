const express = require("express");
const supabase = require("../config/supabase");
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

// Get All Teams
router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("teams").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Assign Team to User (Protected)
router.post("/select", authenticateUser, async (req, res) => {
    const { team_id } = req.body;
    const user_id = req.user.id; // Extracted from JWT token

    // Check if team is already taken
    const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", team_id)
        .single();

    if (teamError || team.owner_id) {
        return res.status(400).json({ error: "Team is already taken" });
    }

    // Assign team to user
    await supabase.from("teams").update({ owner_id: user_id }).eq("id", team_id);
    await supabase.from("users").update({ team_id }).eq("id", user_id);

    res.json({ message: "Team assigned successfully" });
});

module.exports = router;
