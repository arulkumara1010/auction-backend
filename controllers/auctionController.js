const { getUnsoldPlayers, updatePlayerSale } = require("../models/playerModel");
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

module.exports = { startAuction, startNewPlayer };
