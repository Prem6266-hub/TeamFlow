const Notification = require("../models/notification");

const getNotification = async(req,res) => {
    try {
        const notifications = await Notification.find({recipient: req.user._id})
        .populate("sender", "name")
        .sort({createdAt: -1});

        res.status(200).json({
            notifications
        })
    } catch (err) {
        res.status(500).json({
      message:
        "Failed to get notifications",
    });
    }
}

const markAsRead = async(req,res) => {
    try {
        const {notificationId} = req.params;

        await Notification.findByIdAndUpdate(notificationId, {isRead: true});

        res.status(200).json({
            message: "Notification marked as read",
        });
    } catch (err) {
        res.status(500).json({
      message:
        "Failed to Read notification",
    });
    }
}

const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await Notification.findByIdAndDelete(notificationId);

        res.status(200).json({
            message: "Notification removed",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to remove notification",
        });
    }
};

const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });

        res.status(200).json({
            message: "Notifications cleared",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to clear notifications",
        });
    }
};

module.exports = {getNotification, markAsRead, deleteNotification, clearNotifications}