
const express = require("express");
const supabase = require("../config/supabase");
const router = express.Router();

// ✅ Get All Players
router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("players").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

module.exports = router;
