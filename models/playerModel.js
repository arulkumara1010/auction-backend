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
const resetAuction = async () => {
  try {
    const { data, error } = await supabase
      .from("players")
      .update({
        auctioned: false,
        sold: false,
        sold_team: null,
        sold_price: null,
      })
      .eq("auctioned", true);
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("couldn't reset auction:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch all unsold players
const getUnsoldPlayers = async () => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("auctioned", false)
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
      .select("id, playerno, name, role, sold_team, sold_price, country")
      .eq("auctioned", true)
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
const updatePlayerAuctionedStatus = async (playerId) => {
  try {
    const { data, error } = await supabase
      .from("players") // Specify the table
      .update({ auctioned: true }) // Update the auctioned column to true
      .eq("id", playerId); // Filter by player ID

    if (error) throw error; // Throw an error if something goes wrong
    return { success: true, data }; // Return success response
  } catch (error) {
    console.error("Error updating player auctioned status:", error.message);
    return { success: false, error: error.message }; // Return failure response
  }
};
const updatePlayerSale = async (playerId, team, price) => {
  return await supabase
    .from("players")
    .update({ sold: true, sold_team: team, sold_price: price, auctioned: true })
    .eq("id", playerId);
};
module.exports = {
  updatePlayerAuctionedStatus,
  getAllPlayers,
  getUnsoldPlayers,
  getPlayerById,
  getPlayersBought,
  getPlayersBoughtByTeam,
  updatePlayerSale,
  resetAuction,
};
