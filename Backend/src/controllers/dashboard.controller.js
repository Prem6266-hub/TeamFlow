const workSpace = require("../models/workspace");
const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/user");

const getWorkspaceAnalytics = async (req,res) => {
    try {
        const {workSpaceId} = req.params;

        const workspace = await workSpace.findById(workSpaceId);
        if(!workspace){
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isOwner = workspace.owner.toString() === req.user._id.toString();
        const isMember = workspace.members.some((member) => member.toString() === req.user._id.toString());

        if(!isOwner && !isMember){
            return res.status(403).json({
                message: "Access denied",
            });
        }

        const totalProjects = await Project.countDocuments({
            workspace: workSpaceId,
        });

        const totalTasks = await Task.countDocuments({
            workspace: workSpaceId
        });

        const completedTasks = await Task.countDocuments({
            workspace: workSpaceId,
            status: "completed",
        })

        const pendingTasks = await Task.countDocuments({
            workspace: workSpaceId,
            status: {
                $in: ["todo", "in_progress", "review"],
            }
        });

        const overdueTasks = await Task.countDocuments({
            workspace: workSpaceId,
            dueDate: { $lt: new Date() },
      status: {
        $ne: "done",
      },
        })

        const totalMembers =
      workspace.members.length + 1;

    res.status(200).json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalMembers,
    });

    } catch (err) {
        res.status(500).json({
            message: "Failed to get analytics",
        })
    }
}

const getMemberProductivity = async (req,res) => {
    try {
        const {workSpaceId} = req.params;
        const workspace = await workSpace.findById(workSpaceId)
        .populate("owner", "name email")
        .populate("members", "name email");

        if(!workspace){
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isOwner =
      workspace.owner._id.toString() ===
      req.user._id.toString();

    const isMember =
      workspace.members.some(
        member =>
          member._id.toString() ===
          req.user._id.toString()
      );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const users = [workspace.owner, ...workspace.members];

    const productivity = await Promise.all(
        users.map(async user => {
            const assignedTasks = await Task.countDocuments({
                workspace: workSpaceId,
                assignedTo: user._id,
            });

            const completedTasks = await Task.countDocuments({
                workspace: workSpaceId,
                assignedTo: user._id,
                status: "completed",
            });

            const pendingTasks = assignedTasks - completedTasks;

            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                assignedTasks,
                completedTasks,
                pendingTasks,
            };
        })
    );

    res.status(200).json(productivity);

    } catch (err) {
         res.status(500).json({
      message:
        "Failed to get member productivity",
    });
    }
}

const getProjectsProgress = async (req,res) => {
    try {
        const {workSpaceId} = req.params;

        const workspace = await workSpace.findById(workSpaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner =
      workspace.owner.toString() ===
      req.user._id.toString();

    const isMember =
      workspace.members.some(
        member =>
          member.toString() ===
          req.user._id.toString()
      );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    
    const projects = await Project.find({
        workspace: workSpaceId,
    })

    const progressData = await Promise.all(
        projects.map(async project => {
            const totalTasks = await Task.countDocuments({
                project: project._id,
            });
            const completedTasks = await Task.countDocuments({
                project: project._id,
                status: "completed",
            });
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks * 100)); 

            return {
                projectId : project._id,
                projectName: project.name,
          totalTasks,
          completedTasks,
          progress,
            }
        })
    );

    res.status(200).json(progressData);

    } catch (err) {
        res.status(500).json({
      message:
        "Failed to get project progress",
    });
    }
}

module.exports = {getWorkspaceAnalytics, getMemberProductivity, getProjectsProgress};