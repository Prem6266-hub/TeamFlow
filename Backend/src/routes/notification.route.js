const express = require("express");
const notificationRouter = express.Router();

const {getNotification,markAsRead} = require("../controllers/notification.controller");
const {protect, validate} = require("../middlewares/auth.middleware")

notificationRouter.get("/", protect, getNotification);
notificationRouter.patch(
  "/:notificationId/read",
  protect,
  markAsRead
);

module.exports = notificationRouter