const mongoose = require("mongoose");

const activitySchema = mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      enum: [
        "PROJECT",
        "TASK",
        "COMMENT",
        "FILE",
        "WORKSPACE",
      ],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;