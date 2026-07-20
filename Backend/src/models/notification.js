const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_UPDATED",
        "COMMENT_ADDED",
        "MEMBER_INVITED",
        "FILE_UPLOADED",
        "PROJECT_CREATED",
      ],
    },

    relatedWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },

    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;