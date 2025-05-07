const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("private-message", ({ to, message }) => {
      io.to(to).emit("private-message", message);
    });

    socket.on("join-group", (groupId) => socket.join(groupId));
    socket.on("group-message", ({ groupId, message }) =>
      io.to(groupId).emit("group-message", message)
    );
    socket.on("leave-group", (groupId) => socket.leave(groupId));
  });
};

// Assuming socket.io is already initialized and auth is handled

const Group = require("../models/Group");

module.exports = function (io) {
  io.on("connection", (socket) => {
    const userId = socket.userId; // set this after auth

    socket.on("join_group", async ({ groupId }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return socket.emit("error", "Group not found");

        // Add user if not already a member
        if (!group.members.includes(userId)) {
          group.members.push(userId);
          await group.save();
        }

        socket.join(groupId);
        socket.emit("joined_group", { groupId });
        socket
          .to(groupId)
          .emit("notification", { message: `User ${userId} joined.` });
      } catch (err) {
        socket.emit("error", "Failed to join group");
      }
    });
  });
};

module.exports = { initSocket };
