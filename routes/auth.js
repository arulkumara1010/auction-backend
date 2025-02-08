const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
router.post("/register", async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) return res.status(400).json({ error: "All fields required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from("users")
        .insert([{ name, username, password: hashedPassword, role: "user" }]);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "User registered successfully", user: data });
});

// Login User
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

    if (error || !data) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: data.id, username: data.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

module.exports = router;
