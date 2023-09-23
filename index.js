const express = require("express");
const { Server } = require("socket.io");

const app = express();
const http = require("http");
const server = http.createServer(app);

const io = new Server(server, {
  cors: true,
});

const roomToUserMap = {};
const roomToSocketIdMap = new Map();

io.on("connection", (socket) => {
  console.log("connection established", socket.id);

  socket.on("room:join", (data) => {
    const { email, room } = data;
    roomToSocketIdMap.set(socket.id, room);

    if (roomToUserMap[room] && parseInt(roomToUserMap[room]) < 2) {
      roomToUserMap[room] += 1;
      io.to(room).emit("user:joined", {
        email: email,
        id: socket.id,
        userNo: roomToUserMap[room],
      });
    } else if (parseInt(roomToUserMap[room]) >= 2) {
      roomToUserMap[room] += 1;
    } else {
      roomToUserMap[room] = 1;
      // console.log("userJoined 1");
      io.to(room).emit("user:joined", {
        email: email,
        id: socket.id,
      });
    }
    if (parseInt(roomToUserMap[room]) > 2) {
      io.to(socket.id).emit("user:limit");
      // console.log("limit 2");
    } else {
      socket.join(room);
      io.to(socket.id).emit("room:join", data);
    }

    socket.conn.on("close", (reason) => {
      console.log("disconnect");
      let room = roomToSocketIdMap.get(socket.id);
      if (roomToUserMap[room] >= 1) {
        roomToUserMap[room] = 0;
      }
      io.to(room).emit("user:dissconected");
    });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

server.listen(8000, () => {
  console.log("listening on *:3001");
});
