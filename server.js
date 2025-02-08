require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const supabase = require("./config/supabase");

const app = express();
const server = http.createServer(app); // Wrap express app with HTTP server

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());

// Import Routes
app.use("/auth", require("./routes/auth"));
app.use("/teams", require("./routes/teams"));
app.use("/players", require("./routes/players"));
app.use("/auction", require("./routes/auction"));

let currentPlayer = null;
let timer = null;

// ✅ Real-time Socket.io logic
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 🎯 Start the auction (only if 10 teams have owners)
    socket.on("start_auction", async () => {
        const { data: teams, error } = await supabase
            .from("teams")
            .select("*")
            .not("owner_id", "is", null);

        if (error || teams.length < 10) {
            socket.emit("auction_error", "Not enough teams to start.");
            return;
        }

        startNewPlayer(io);
    });

    // 🏏 Handle bidding
    socket.on("place_bid", async ({ player_id, bid_amount, team_id }) => {
        if (!currentPlayer || currentPlayer.id !== player_id) {
            socket.emit("bid_error", "Invalid bid or player not active.");
            return;
        }

        const { data: team, error: teamError } = await supabase
            .from("teams")
            .select("salary_cap")
            .eq("id", team_id)
            .single();

        if (teamError || team.salary_cap < bid_amount) {
            socket.emit("bid_error", "Insufficient funds.");
            return;
        }

        currentPlayer.soldprice = bid_amount;
        currentPlayer.soldteam = team_id;

        io.emit("update_bid", { player_id, bid_amount, team_id });
    });

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// 🎯 Pick a random player from the same set
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
    currentPlayer = sameSetPlayers[randomIndex];

    // Notify all clients
    io.emit("new_player", currentPlayer);

    // ⏳ Start countdown timer (30 seconds)
    let timeLeft = 30;
    clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            finalizeBid(io);
        } else {
            io.emit("timer_update", timeLeft);
            timeLeft--;
        }
    }, 1000);
};

// ✅ Finalize bid when time runs out
const finalizeBid = async (io) => {
    if (currentPlayer.soldteam) {
        await supabase
            .from("players")
            .update({ sold: true, soldteam: currentPlayer.soldteam, soldprice: currentPlayer.soldprice })
            .eq("id", currentPlayer.id);
    }

    startNewPlayer(io);
};


const testDB = async () => {
    const { data, error } = await supabase.from("players").select("*").limit(5);
    if (error) {
        console.error("❌ Supabase connection failed:", error.message);
    } else {
        console.log("✅ Supabase connection successful:", data);
    }
};

testDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
