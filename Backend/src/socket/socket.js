const connectedUsers = new Map();
const onlineUsers = new Set();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join", (userId) => {
      connectedUsers.set(userId, socket.id);

      onlineUsers.add(userId);

io.emit(
  "onlineUsers",
  [...onlineUsers]
);

      console.log(
        `User ${userId} joined with socket ${socket.id}`
      );
    });

    socket.on(
    "joinWorkspace",
    (workspaceId) => {
      socket.join(workspaceId);
    }
  );

    socket.onAny((event) => {
  console.log(
    `Socket Event: ${event}`
  );
});

    socket.on("disconnect", () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          onlineUsers.delete(userId);
          break;
        }
      }

       io.emit(
    "onlineUsers",
    [...onlineUsers]
  );

      console.log("User Disconnected");
    });
  });
};

module.exports = {
  socketHandler,
  connectedUsers,
  onlineUsers
};