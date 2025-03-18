const {
  getAllPlayers,
  getUnsoldPlayers,
  getPlayerById,
  getPlayersBought,
  getPlayersBoughtByTeam,
} = require("../models/playerModel");

// Fetch all players
const getPlayers = async (req, res) => {
  const { success, data, error } = await getAllPlayers();
  if (!success) return res.status(500).json({ error });
  res.status(200).json(data);
};

// Fetch all unsold players
const getUnsoldPlayersController = async (req, res) => {
  const { success, data, error } = await getUnsoldPlayers();
  if (!success) return res.status(500).json({ error });
  res.status(200).json(data);
};

// Fetch a player by ID
const getPlayerByIdController = async (req, res) => {
  const { player_id } = req.params;
  const { success, data, error } = await getPlayerById(player_id);
  if (!success) return res.status(404).json({ error: "Player not found" });
  res.status(200).json(data);
};

// Fetch all bought players
const getPlayersBoughtController = async (req, res) => {
  const { success, data, error } = await getPlayersBought();
  if (!success) return res.status(500).json({ error });
  res.status(200).json(data);
};

// Fetch players bought by a specific team
const getPlayersBoughtByTeamController = async (req, res) => {
  const { team_id } = req.params;
  const { success, data, error } = await getPlayersBoughtByTeam(team_id);
  if (!success) return res.status(500).json({ error });
  res.status(200).json(data);
};

module.exports = {
  getPlayers,
  getUnsoldPlayersController,
  getPlayerByIdController,
  getPlayersBoughtController,
  getPlayersBoughtByTeamController,
};
