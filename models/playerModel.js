const supabase = require("../config/supabase");

const getUnsoldPlayers = async () => {
  return await supabase.from("players").select("*").eq("sold", false);
};

const updatePlayerSale = async (playerId, team, price) => {
  return await supabase
    .from("players")
    .update({ sold: true, sold_team: team, sold_price: price })
    .eq("id", playerId);
};

module.exports = { getUnsoldPlayers, updatePlayerSale };
