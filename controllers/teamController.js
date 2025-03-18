const {
  getAllTeams,
  assignTeamToUser,
  countAssignedTeams,
} = require("../models/teamModel");
const { startAuction } = require("./auctionController");

const getTeams = async (req, res) => {
  const { data, error } = await getAllTeams();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

const selectTeam = async (req, res) => {
  const { team_id } = req.body;
  const user_id = req.user.id;

  const { count, error } = await countAssignedTeams();
  if (error) return res.status(500).json({ error: "Failed to check teams" });

  await assignTeamToUser(team_id, user_id);

  res.json({ message: "Team assigned successfully" });
};

module.exports = { getTeams, selectTeam };
