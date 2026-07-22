const Project = require("../models/project");
const workSpace = require("../models/workspace");
const createActivity = require("../utils/createActivity");
const createNotification = require("../utils/createNotification");

const createProjectController = async (req, res) => {
  try {
    const { name, description, workSpaceId } = req.body;
    const workspace = await workSpace.findById(workSpaceId);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const project = await Project.create({
      name,
      description,
      workspace: workSpaceId,
      createdBy: req.user._id,
    });

    const io = req.app.get("io");

    io.to(workSpaceId).emit("projectCreated", {
      projectId: project._id,
      name: project.name,
    });

    const recipients = [...new Set([
      workspace.owner.toString(),
      ...workspace.members.map((member) => member.toString()),
    ])];

    for (const recipientId of recipients) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        message: `${req.user.name || "A user"} created project "${project.name}"`,
        type: "PROJECT_CREATED",
        io,
        relatedWorkspace: workSpaceId,
        relatedProject: project._id,
      });
    }

    await createActivity({
  workspace: workSpaceId,
  user: req.user._id,
  action: `created project ${project.name}`,
  entityType: "PROJECT",
  entityId: project._id,
});

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create project",
    });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workSpaceId } = req.params;
    const workspace = await workSpace.findById(workSpaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "workspace not found",
      });
    }

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const projects = await Project.find({
      workspace: workSpaceId,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get projects",
    });
  }
};

const getSingleProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("createdBy", "name email")
      .populate("workspace", "name");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await workSpace.findById(project.workspace._id);

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
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get project",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

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

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update project",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await workSpace.findById(project.workspace);

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        message: "You are not authorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete project",
    });
  }
};

module.exports = {
  createProjectController,
  getWorkspaceProjects,
  getSingleProject,
  updateProject,
  deleteProject,
};
