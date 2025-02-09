require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");  // ✅ Import Singleton Socket
const supabase = require("./config/supabase");
const { setupSocketListeners } = require("./routes/auction");

const app = express();
const server = http.createServer(app);  // Wrap Express with HTTP server

app.use(express.json());
app.use(cors());

// ✅ Initialize Socket.io only once
const io = initSocket(server);

// ✅ Pass `io` to auction system
setupSocketListeners(io);

// ✅ Import Routes
app.use("/auth", require("./routes/auth"));
app.use("/teams", require("./routes/teams"));
app.use("/players", require("./routes/players"));
app.use("/auction", require("./routes/auction").router);  // 🛠 Fix: Use `.router`

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
