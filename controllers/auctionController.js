const {
  getUnsoldPlayers,
  updatePlayerSale,
  getPlayerById,
} = require("../models/playerModel");
const { getIO } = require("../socket");

let bidTimer = null;
let currentBid = { playerId: null, team: null, bidAmount: 0 };

const startAuction = async () => {
  const io = getIO();
  io.emit("auction_started");
  console.log("auction started");
  startNewPlayer(io);
};

const startNewPlayer = async (io) => {
  console.time("Fetching unsold players");
  const { data: players, error } = await getUnsoldPlayers();
  console.timeEnd("Fetching unsold players");

  if (error || !players.length) {
    io.emit("auction_ended");
    return;
  }

  const currentPlayer = players[0];
  currentBid = {
    playerId: currentPlayer.id,
    team: null,
    bidAmount: currentPlayer.baseprice,
  };

  io.emit("new_player", currentPlayer);
  resetTimer(io, currentPlayer);
};

const resetTimer = (io, player) => {
  clearInterval(bidTimer); // Clear any existing timer
  timeLeft = 10; // Reset the countdown

  bidTimer = setInterval(async () => {
    if (timeLeft <= 0) {
      clearInterval(bidTimer);
      await finalizeBid(io, player);
    } else {
      io.emit("timer_update", timeLeft--);
    }
  }, 1000);
};
const handleBid = async (io, { player_id, team_id }) => {
  console.log(`🏏 Handling bid: Player ${player_id}, Team ${team_id}`);

  if (player_id !== currentBid.playerId) {
    console.log("❌ Bid rejected: Wrong player.");
    return;
  }

  // Fetch the player details
  const { data: player, error } = await getPlayerById(player_id);
  if (error || !player) {
    console.log("❌ Error fetching player:", error);
    return;
  }

  // Ensure base price is a valid number
  const basePrice = Number(player.base_price) || 0;
  let currentAmount = Number(currentBid.bidAmount);

  // If currentAmount is NaN, set it to base price
  if (isNaN(currentAmount) || currentAmount === 0) {
    currentAmount = basePrice;
  }

  // Define bid increment logic
  let bidIncrement = 5;
  if (currentAmount >= 100) bidIncrement = 10;
  if (currentAmount >= 200) bidIncrement = 20;
  if (currentAmount >= 500) bidIncrement = 25;

  // Calculate new bid amount safely
  let newBidAmount = currentAmount + bidIncrement;

  // Final check to prevent NaN values
  if (isNaN(newBidAmount) || newBidAmount <= 0) {
    console.error("❌ Error: New bid amount is invalid (NaN or negative)");
    return;
  }

  // Update the current bid
  currentBid = { playerId: player_id, team: team_id, bidAmount: newBidAmount };
  console.log(`✅ New highest bid: ₹${newBidAmount}L by Team ${team_id}`);

  resetTimer(io, player);
  io.emit("bid_update", { player_id, team_id, bid_amount: newBidAmount });
};
const finalizeBid = async (io, player) => {
  if (currentBid.team) {
    await updatePlayerSale(player.id, currentBid.team, currentBid.bidAmount);
    io.emit("player_sold", {
      playerId: player.id,
      team: currentBid.team,
      price: currentBid.bidAmount,
    });
  } else {
    io.emit("player_unsold", player.id);
  }

  setTimeout(() => startNewPlayer(io), 3000);
};
const setupSocketListeners = (io) => {
  let selectedTeams = new Set();
  const totalTeams = 3;
  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}`);
    socket.on("team_selected", (teamId) => {
      selectedTeams.add(teamId);
      console.log(`Team selected: ${teamId}`);

      if (selectedTeams.size === totalTeams) {
        io.emit("teams_picked"); // Notify all clients that teams are picked
      }
    });

    socket.on("start_auction", () => {
      io.emit("auction_started"); // Start auction event
    });
    socket.on("place_bid", (data) => {
      console.log("📩 Bid received:", data);
      handleBid(io, data);
    });
  });
};
module.exports = {
  startAuction,
  startNewPlayer,
  handleBid,
  setupSocketListeners,
};
