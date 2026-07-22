const Task = require("../models/task");
const workSpace = require("../models/workspace");
const Project = require("../models/project");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const createNotification = require("../utils/createNotification");
const createActivity = require("../utils/createActivity");

const getWorkspaceParticipantIds = (workspace) => new Set([
  workspace.owner.toString(),
  ...workspace.members.map((member) => member.toString()),
]);

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } =
      req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await workSpace.findById(project.workspace);

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
      return res.status(404).json({
        message: "Assigned user not found",
      });
    }

    const assignedIsOwner = workspace.owner.toString() === assignedTo;

    const assignedIsMember = workspace.members.some(
      (member) => member.toString() === assignedTo,
    );

    if (!assignedIsOwner && !assignedIsMember) {
      return res.status(400).json({
        message: "Assigned user is not part of workspace",
      });
    }

    const task = await Task.create({
      title,
      description,
      project: project._id,
      workspace: workspace._id,
      assignedTo,
      createdBy: req.user._id,
      priority,
      dueDate,
    });

    const io = req.app.get("io");

    io.to(task.workspace.toString()).emit(
  "taskCreated",
  {
    taskId: task._id,
    title: task.title,
    assignedTo: task.assignedTo,
  }
);

    const assignedId = assignedTo ? assignedTo.toString() : null;
    const workspaceRecipientIds = getWorkspaceParticipantIds(workspace);
    const notificationRecipients = [...workspaceRecipientIds];

    for (const recipientId of notificationRecipients) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        message: recipientId === assignedId
          ? "You've been assigned a task"
          : `Task "${task.title}" was created in the workspace`,
        type: "TASK_ASSIGNED",
        io,
        relatedWorkspace: workspace._id,
        relatedTask: task._id,
      });
    }

    await createActivity({
  workspace: task.workspace,
  user: req.user._id,
  action: `created task ${task.title}`,
  entityType: "TASK",
  entityId: task._id,
});

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to create task",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await workSpace.findById(project.workspace);

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const tasks = await Task.find({
      project: projectId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get tasks",
    });
  }
};

const getSingleTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .populate("workspace", "name owner");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await workSpace.findById(task.workspace._id);

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      task,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get tasks",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await workSpace.findById(task.workspace);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isAssigned && !isWorkspaceOwner) {
      return res.status(403).json({
        message: "Only the assigned user or workspace owner can edit this task",
      });
    }

    const previousAssignedTo = task.assignedTo?.toString();
    let assignedUserChanged = false;

    if (assignedTo) {
      const user = await User.findById(assignedTo);

      if (!user) {
        return res.status(404).json({
          message: "Assigned user not found",
        });
      }

      const isWorkspaceOwner = workspace.owner.toString() === assignedTo;

      const isWorkspaceMember = workspace.members.some(
        (member) => member.toString() === assignedTo,
      );

      if (!isWorkspaceOwner && !isWorkspaceMember) {
        return res.status(400).json({
          message: "Assigned user is not part of workspace",
        });
      }

      assignedUserChanged = previousAssignedTo !== assignedTo.toString();
      task.assignedTo = assignedTo;
    }

    if(title !== undefined){
        task.title = title;
    }

    if(description !== undefined){
        task.description = description;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    await task.save();

    const io = req.app.get("io");

    io.to(task.workspace.toString()).emit(
  "taskUpdated",
  {
    taskId: task._id,
    title: task.title,
    status: task.status,
  }
);

    const workspaceRecipientIds = getWorkspaceParticipantIds(workspace);
    const notificationRecipients = [...workspaceRecipientIds];

    if (assignedUserChanged && assignedTo) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        message: "You've been assigned a task",
        type: "TASK_ASSIGNED",
        io,
        relatedWorkspace: workspace._id,
        relatedTask: task._id,
      });
    }

    for (const recipientId of notificationRecipients) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        message: `Task "${task.title}" updated`,
        type: "TASK_UPDATED",
        io,
        relatedWorkspace: workspace._id,
        relatedTask: task._id,
      });
    }


await createActivity({
  workspace: task.workspace,
  user: req.user._id,
  action: `updated task ${task.title}`,
  entityType: "TASK",
  entityId: task._id,
  io,
});

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Failed to update task",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await workSpace.findById(
      task.workspace
    );

    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isAssigned && !isWorkspaceOwner) {
      return res.status(403).json({
        message: "Only the assigned user or workspace owner can update task status",
      });
    }

    task.status = status;

    await task.save();

    const io = req.app.get("io");

    io.to(task.workspace.toString()).emit(
  "taskStatusChanged",
  {
    taskId: task._id,
    status: task.status,
  }
);

    const workspaceRecipientIds = getWorkspaceParticipantIds(workspace);
    const notificationRecipients = [...workspaceRecipientIds];

    for (const recipientId of notificationRecipients) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        message: `Task "${task.title}" status changed to ${status}`,
        type: "TASK_UPDATED",
        io,
        relatedWorkspace: workspace._id,
        relatedTask: task._id,
      });
    }

if(task.status === "completed"){

  await createActivity({
    workspace: task.workspace,
    user: req.user._id,
    action: `completed task ${task.title}`,
    entityType: "TASK",
    entityId: task._id,
  });

}

    res.status(200).json({
      message: "Task status updated successfully",
      task,
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to update task status",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await workSpace.findById(
      task.workspace
    );

    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isAssigned && !isWorkspaceOwner) {
      return res.status(403).json({
        message: "Only the assigned user or workspace owner can delete this task",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      message: "Task deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
};

const addComment = async (req,res) => {
  try {
    const {taskId} = req.params;
    const {text} = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspace = await workSpace.findById(
      task.workspace
    );

    const isOwner =
      workspace.owner.toString() === req.user._id.toString();

    const isMember =
      workspace.members.some(
        member =>
          member.toString() === req.user._id.toString()
      );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();
    await task.populate("comments.user", "name email");

    const io = req.app.get("io");
    const newComment = task.comments[task.comments.length - 1];
    const commentPayload = {
      taskId: task._id,
      comment: newComment.toObject ? newComment.toObject() : newComment,
    };

    io.to(task.workspace.toString()).emit("commentAdded", commentPayload);

const workspaceRecipientIds = getWorkspaceParticipantIds(workspace);
      const notificationRecipients = [...workspaceRecipientIds];

    for (const recipientId of notificationRecipients) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        message: `${req.user.name} commented on "${task.title}"`,
        type: "COMMENT_ADDED",
        io,
        relatedWorkspace: workspace._id,
        relatedTask: task._id,
      });
    }

await createActivity({
  workspace: task.workspace,
  user: req.user._id,
  action: `commented on ${task.title}`,
  entityType: "COMMENT",
  entityId: task._id,
});

    res.status(200).json({
      message: "Comment added successfully",
      comments: task.comments,
    });


  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Failed to add comment",
    });
  }
}

const getTasksComment = async (req,res) => {
  try {
    const {taskId} = req.params;

    const task = await Task.findById(taskId)
    .populate("comments.user","name email");

    if(!task){
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      comments: task.comments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get comments",
    });
  }
}

  const deleteComment = async (req, res) => {
    try {
      const { taskId, commentId } = req.params;

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const workspace = await workSpace.findById(task.workspace);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      const comment = task.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();
      const isCommentAuthor = comment.user && comment.user.toString() === req.user._id.toString();

      if (!isWorkspaceOwner && !isCommentAuthor) {
        return res.status(403).json({ message: 'Only the workspace owner or comment author can delete this comment' });
      }

      comment.remove();
      await task.save();

      const io = req.app.get('io');
      if (io) {
        io.to(task.workspace.toString()).emit('commentDeleted', { taskId: task._id, commentId });
      }

      res.status(200).json({ message: 'Comment deleted', commentId, comments: task.comments });
    } catch (err) {
      console.error('Delete comment error:', err);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  }

const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const workspace = await workSpace.findById(task.workspace);
    const isWorkspaceOwner = workspace?.owner?.toString() === req.user._id.toString();

    if (!isWorkspaceOwner) {
      return res.status(403).json({
        message: "Only the workspace owner can upload attachments",
      });
    }

    const uploadResult = await new Promise(
      (resolve, reject) => {

        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "teamflow",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      }
    );

    task.attachments.push({
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      uploadedBy: req.user._id,
    });

    await task.save();

    const attachment =
      task.attachments[task.attachments.length - 1];

    const io = req.app.get("io");

    io.to(task.workspace.toString()).emit(
      "attachmentUploaded",
      {
        taskId: task._id,
        taskTitle: task.title,
        fileName: req.file.originalname,
        uploadedBy: req.user.name,
        fileUrl: uploadResult.secure_url,
      }
    );

    try {
      const workspaceRecipientIds = getWorkspaceParticipantIds(workspace);
      const notificationRecipients = [...workspaceRecipientIds];

      for (const recipientId of notificationRecipients) {
        await createNotification({
          recipient: recipientId,
          sender: req.user._id,
          message: `${req.user.name} uploaded a file in "${task.title}"`,
          type: "FILE_UPLOADED",
          io,
          relatedWorkspace: workspace._id,
          relatedTask: task._id,
        });
      }
    } catch (notificationError) {
      console.error("Attachment uploaded but notification failed:", notificationError);
    }

    try {
      await createActivity({
        workspace: task.workspace,
        user: req.user._id,
        action: `uploaded ${req.file.originalname}`,
        entityType: "FILE",
        entityId: task._id,
      });
    } catch (activityError) {
      console.error("Attachment uploaded but activity logging failed:", activityError);
    }

    res.status(201).json({
      message: "File uploaded successfully",
      attachment,
    });

  } catch (err) {
    console.error("Upload attachment error:", err);
    res.status(500).json({
      message:
        err?.message ||
        "Failed to upload attachment",
    });
  }
};


const getAttachments = async (req,res) => {
  try {
    const {taskId} = req.params;

    const task = await Task.findById(taskId)
    .populate("attachments.uploadedBy", "name email");

    if(!task){
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      attachments: task.attachments,
    });
  } catch (err) {
     res.status(500).json({
      message:
        "Failed to get attachments",
    });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isCreator) {
      return res.status(403).json({
        message: "Only the task creator can remove attachments",
      });
    }

    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    task.attachments.pull(attachment);
    await task.save();

    const io = req.app.get("io");
    if (io) {
      io.to(task.workspace.toString()).emit("attachmentDeleted", {
        taskId: task._id,
        attachmentId,
      });
    }

    res.status(200).json({
      message: "Attachment removed successfully",
      attachmentId,
    });
  } catch (err) {
    console.error("Delete attachment error:", err);
    res.status(500).json({
      message:
        err?.message ||
        "Failed to delete attachment",
    });
  }
};

module.exports = { createTask, getProjectTasks, getSingleTask, updateTask, updateTaskStatus, deleteTask, addComment, getTasksComment, deleteComment, uploadAttachment, getAttachments, deleteAttachment };
