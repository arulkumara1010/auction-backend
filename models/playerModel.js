const supabase = require("../config/supabase");

const getAllPlayers = async () => {
  return await supabase.from("players").select("*");
};

const getUnsoldPlayers = async () => {
  return await supabase.from("players").select("*").eq("sold", false).order("playerno");
};

const updatePlayerSale = async (playerId, team, price) => {
  return await supabase
    .from("players")
    .update({ sold: true, sold_team: team, sold_price: price })
    .eq("id", playerId);
};
const getPlayerById = async (player_id) => {
  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", player_id)
    .single();

  if (error) {
    console.error("Error fetching player:", error.message);
  }

  return { data: player, error };
};

module.exports = {
  getAllPlayers,
  getUnsoldPlayers,
  updatePlayerSale,
  getPlayerById,
};
