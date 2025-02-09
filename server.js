require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(express.json());
app.use(cors());

app.use("/auth", require("./routes/authRoutes"));
app.use("/teams", require("./routes/teamRoutes"));
app.use("/players", require("./routes/playerRoutes"));
app.use("/auction", require("./routes/auctionRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
