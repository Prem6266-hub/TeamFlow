const Notification = require("../models/notification");
const { connectedUsers } = require("../socket/socket");

const createNotification = async ({ recipient, sender, message, type, io }) => {
  const notification = await Notification.create({
    recipient,
    sender,
    message,
    type,
  });

  const socketId = connectedUsers.get(recipient.toString());

  if (socketId) {
    io.to(socketId).emit("newNotification", {
      id: notification._id,
      message,
      type,
      sender,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

module.exports = createNotification;
