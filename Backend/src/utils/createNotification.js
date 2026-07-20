const Notification = require("../models/notification");
const { connectedUsers } = require("../socket/socket");

const createNotification = async ({ recipient, sender, message, type, io, relatedWorkspace, relatedProject, relatedTask }) => {
  const notification = await Notification.create({
    recipient,
    sender,
    message,
    type,
    relatedWorkspace,
    relatedProject,
    relatedTask,
  });

  const socketId = connectedUsers.get(recipient.toString());

  if (socketId) {
    io.to(socketId).emit("newNotification", {
      _id: notification._id,
      id: notification._id,
      message,
      type,
      sender,
      createdAt: notification.createdAt,
      relatedWorkspace,
      relatedProject,
      relatedTask,
    });
  }

  return notification;
};

module.exports = createNotification;
