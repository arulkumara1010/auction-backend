const { getAllPlayers } = require("../models/playerModel");

const getPlayers = async (req, res) => {
  const { data, error } = await getAllPlayers();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

module.exports = { getPlayers };
