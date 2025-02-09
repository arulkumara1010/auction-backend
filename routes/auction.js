const express = require("express");
const { getIO } = require("../socket");
const supabase = require("../config/supabase");

const router = express.Router();

let bidTimer = null;
let currentBid = { playerId: null, team: null, bidAmount: 0 };

// ✅ Function to Start Auction
const startAuction = async () => {
    console.log("🔥 10 teams assigned! Starting auction...");

    const io = getIO();
    io.emit("auction_started");

    // Start selecting the first player
    startNewPlayer(io);
};

// ✅ Select and Start a New Player Auction
const startNewPlayer = async (io) => {
    const { data: unsoldPlayers, error } = await supabase
        .from("players")
        .select("*")
        .eq("sold", false);

    if (error || !unsoldPlayers.length) {
        io.emit("auction_ended", "All players have been auctioned.");
        return;
    }

    // Pick a random player from the same set
    const setno = unsoldPlayers[0].setno;
    const sameSetPlayers = unsoldPlayers.filter(player => player.setno === setno);

    if (!sameSetPlayers.length) {
        io.emit("auction_ended", "No more players in this set.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * sameSetPlayers.length);
    const currentPlayer = sameSetPlayers[randomIndex];

    console.log(`🎯 Starting auction for ${currentPlayer.name}`);

    // Initialize bid tracking
    currentBid = {
        playerId: currentPlayer.id,
        team: null,
        bidAmount: currentPlayer.baseprice || 0
    };

    // Notify all clients
    io.emit("new_player", currentPlayer);

    // ⏳ Start countdown timer (30 seconds)
    let timeLeft = 30;
    bidTimer = setInterval(async () => {
        if (timeLeft <= 0) {
            clearInterval(bidTimer);
            console.log(`⏳ Time's up! Finalizing bid for ${currentPlayer.name}`);
            await finalizeBid(io, currentPlayer);
        } else {
            io.emit("timer_update", timeLeft);
            timeLeft--;
        }
    }, 1000);
};

// ✅ Handle Incoming Bids
const handleBid = async (io, { player_id, team_id, bid_amount }) => {
    console.log(`🏏 Handling bid: Player ${player_id}, Team ${team_id}, Amount ₹${bid_amount}L`);

    if (player_id !== currentBid.playerId) {
        console.log("❌ Bid rejected: Wrong player.");
        return;
    }

    const { data: player, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", player_id)
        .single();

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

// ✅ Finalize Bid & Move to Next Player
const finalizeBid = async (io, player) => {
    if (currentBid.team) {
        console.log(`🎉 Player ${player.name} SOLD to Team ${currentBid.team} for ₹${currentBid.bidAmount}L`);

        // ✅ Update the database
        await supabase
            .from("players")
            .update({ sold: true, sold_team: currentBid.team, sold_price: currentBid.bidAmount })
            .eq("id", player.id);
        console.log(`Table Updated`);
        io.emit("player_sold", {
            playerId: player.id,
            team: currentBid.team,
            price: currentBid.bidAmount
        });
    } else {
        console.log(`❌ Player ${player.name} went UNSOLD`);
        io.emit("player_unsold", player.id);
    }

    // ✅ Reset bid tracking
    currentBid = { playerId: null, team: null, bidAmount: 0 };

    // ✅ Start next player
    setTimeout(() => startNewPlayer(io), 3000); // Small delay before next player
};

// ✅ Set up socket events
const setupSocketListeners = (io) => {
    io.on("connection", (socket) => {
        console.log(`⚡ New client connected: ${socket.id}`);

        socket.on("place_bid", (data) => {
            console.log("📩 Bid received:", data);
            handleBid(io, data);
        });
    });
};

module.exports = { router, startAuction, setupSocketListeners };
