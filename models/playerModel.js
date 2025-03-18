const supabase = require("../config/supabase");

// Fetch all players
const getAllPlayers = async () => {
  try {
    const { data, error } = await supabase.from("players").select("*");
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching all players:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch all unsold players
const getUnsoldPlayers = async () => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("sold", false)
      .order("playerno");
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching unsold players:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch a player by ID
const getPlayerById = async (player_id) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", player_id)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching player ID ${player_id}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Fetch all bought players
const getPlayersBought = async () => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, role, sold_team, sold_price, country")
      .not("sold_team", "is", null)
      .order("sold_team");
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching players bought:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch players bought by a specific team
const getPlayersBoughtByTeam = async (team_id) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, role, sold_price")
      .eq("sold_team", team_id)
      .order("sold_price", { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching players for team ${team_id}:`, error.message);
    return { success: false, error: error.message };
  }
};

const updatePlayerSale = async (playerId, team, price) => {
  return await supabase
    .from("players")
    .update({ sold: true, sold_team: team, sold_price: price })
    .eq("id", playerId);
};
module.exports = {
  getAllPlayers,
  getUnsoldPlayers,
  getPlayerById,
  getPlayersBought,
  getPlayersBoughtByTeam,
  updatePlayerSale,
};
