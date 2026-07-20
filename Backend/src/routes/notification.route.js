const express = require("express");
const notificationRouter = express.Router();

const {getNotification, markAsRead, deleteNotification, clearNotifications} = require("../controllers/notification.controller");
const {protect, validate} = require("../middlewares/auth.middleware")

notificationRouter.get("/", protect, getNotification);
notificationRouter.delete("/", protect, clearNotifications);
notificationRouter.delete(
  "/:notificationId",
  protect,
  deleteNotification
);
notificationRouter.patch(
  "/:notificationId/read",
  protect,
  markAsRead
);

module.exports = notificationRouter