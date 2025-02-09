const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerUser, findUserByUsername } = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ error: "All fields required" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const { error } = await registerUser(name, username, hashedPassword);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "User registered successfully" });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const { data, error } = await findUserByUsername(username);

  if (error || !data)
    return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: data.id, username: data.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
};

module.exports = { register, login };
