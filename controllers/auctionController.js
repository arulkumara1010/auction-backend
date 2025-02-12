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
  startNewPlayer(io);
};

const startNewPlayer = async (io) => {
  const { data: players, error } = await getUnsoldPlayers();
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

  let timeLeft = 30;
  bidTimer = setInterval(async () => {
    if (timeLeft <= 0) {
      clearInterval(bidTimer);
      await finalizeBid(io, currentPlayer);
    } else {
      io.emit("timer_update", timeLeft--);
    }
  }, 1000);
};

const handleBid = async (io, { player_id, team_id, bid_amount }) => {
  console.log(
    `🏏 Handling bid: Player ${player_id}, Team ${team_id}, Amount ₹${bid_amount}L`
  );

  if (player_id !== currentBid.playerId) {
    console.log("❌ Bid rejected: Wrong player.");
    return;
  }

  const { data: player, error } = await getPlayerById(player_id);

  if (error || !player) {
    console.log("❌ Error fetching player:", error);
    return;
  }

  const minBid = Math.max(player.baseprice, currentBid.bidAmount);
  if (bid_amount <= minBid) {
    io.to(team_id).emit("bid_error", { message: "Bid too low!" });
    console.log("❌ Bid rejected: Too low.");
    return;
  }

  // ✅ Update highest bid
  currentBid = { playerId: player_id, team: team_id, bidAmount: bid_amount };
  console.log(`✅ New highest bid: ₹${bid_amount}L by Team ${team_id}`);

  // ✅ Notify all clients
  io.emit("bid_update", { player_id, team_id, bid_amount });
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
  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}`);

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
