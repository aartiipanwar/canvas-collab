const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

console.log("Starting server...");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);
    const count = room ? room.size : 0;

    io.to(roomId).emit("user-count", count);
  });

  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", message);
  });

  socket.on("draw", (data) => {
    socket.to(data.roomId).emit("draw", data);
  });

  socket.on("clear", (roomId) => {
    socket.to(roomId).emit("clear");
  });

  socket.on("disconnect", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        const room = io.sockets.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        io.to(roomId).emit("user-count", count);
      }
    });
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });
});

// ✅ IMPORTANT: Ye bahar hoga
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});