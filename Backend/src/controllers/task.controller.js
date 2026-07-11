const Task = require("../models/task");
const workSpace = require("../models/workspace");
const Project = require("../models/project");
const User = require("../models/user");

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
      .populate("assignedTo", "name, email")
      .populate("createdBy", "name, email")
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
      .populate("workspace", "name");

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

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        message: "You are not authorized to update this task",
      });
    }

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

    const isOwner =
      workspace.owner.toString() === req.user._id.toString();

    const isCreator =
      task.createdBy.toString() === req.user._id.toString();

    const isAssignee =
      task.assignedTo.toString() === req.user._id.toString();

    if (!isOwner && !isCreator && !isAssignee) {
      return res.status(403).json({
        message: "You are not authorized to update task status",
      });
    }

    task.status = status;

    await task.save();

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

    const isOwner =
      workspace.owner.toString() === req.user._id.toString();

    const isCreator =
      task.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        message: "You are not authorized to delete this task",
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

module.exports = { createTask, getProjectTasks, getSingleTask, updateTask, updateTaskStatus, deleteTask, addComment, getTasksComment };
