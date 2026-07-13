const Activity = require("../models/activity");

const createActivity = async ({workspace, user, action, entityType, entityId, io}) => {
    const activity = await Activity.create({
        workspace,
        user,
        action,
        entityType,
        entityId,
    });

    if (io) {
        io.to(workspace.toString()).emit("activityCreated", {
            action,
            user,
            entityType,
        });
    }

    return activity;
};

module.exports = createActivity;