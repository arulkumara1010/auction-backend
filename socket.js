const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*", // Allow frontend connection
        methods: ["GET", "POST"],
      },
    });

    console.log("✅ Socket.io initialized");

    io.on("connection", (socket) => {
      console.log(`⚡ New client connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized! Call initSocket(server) first."
    );
  }
  return io;
};

module.exports = { initSocket, getIO };
