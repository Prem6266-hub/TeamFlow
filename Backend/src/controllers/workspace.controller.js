const workSpace = require("../models/workspace");
const User = require("../models/user");

const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await workSpace.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create workspace",
    });
  }
};

const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await workSpace
      .find({
        members: req.user._id,
      })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch workspaces",
    });
  }
};

const inviteUsertoWorkspace = async (req, res) => {
  try {

    const { email } = req.body;

    const workspace = await workSpace.findById(req.params.workSpaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only owner can invite members",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (workspace.members.includes(user._id)) {
      return res.status(400).json({
        message: "User already a member",
      });
    }

    workspace.members.push(user._id);

    await workspace.save();

    res.status(200).json({
        message: "Member invited successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to invite user to workspace",
    });
  }
};

const getSingleWorkspace = async (req,res) => {
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

        const isMember = workspace.members.some(
            (member) => member._id.toString() === req.user._id.toString()
        );

        if(!isMember){
            return res.status(403).json({
                message: "Access denied",
            });
        }

        res.status(200).json({
            workspace,
        });

    } catch (err) {
        res.status(500).json({
      message: "Failed to fetch workspace",
    });
    }
}

const removeWorkspaceMember = async(req,res) => {
    try {
        const {workSpaceId, memberId} = req.params;

    const workspace = await workSpace.findById(workSpaceId);

    if(!workspace){
        return res.status(404).json({
            message: "Workspace not found",
        });
    }

    if(workspace.owner.toString() !== req.user._id.toString()){
        return res.status(403).json({
            message: "Only owner can remove members",
        });
    }

    if(workspace.owner.toString() == memberId){
        return res.status(400).json({
            message: "Owner cannot be removed",
        });
    }

    const memberExists = workspace.members.some(
        (member) => member.toString() === memberId
    );

    if(!memberExists){
        return res.status(404).json({
            message: "Member not found",
        })
    }

    workspace.members.pull(memberId);

    await workspace.save();

    res.status(200).json({
        message: "Member removed successfully",
    });
    } catch (err) {
        res.status(500).json({
            message: "Failed to remove member",
        });
    }
    
}

const updateWorkspace = async(req,res) => {
    try {
        const {workSpaceId} = req.params;

    const workspace = await workSpace.findById(workSpaceId);
    if(!workspace){
        return res.status(404).json({
            message: "Workspace not found",
        });
    };

    if(workspace.owner.toString() !== req.user._id.toString()){
        return res.status(403).json({
            message: "Only owner can update Info",
        });
    }

    workspace.name = req.body.name || workspace.name;
    workspace.description = req.body.description || workspace.description;

    await workspace.save();

    res.status(200).json({
        message: "Info updated successfully",
    });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update info",
        });
    }
    
}

const deleteWorkspace = async(req,res) => {
    try {
        const {workSpaceId} = req.params;

    const workspace = await workSpace.findById(workSpaceId);
    if(!workspace){
        return res.status(404).json({
            message: "Workspace not found",
        });
    };

    if(workspace.owner.toString() !== req.user._id.toString()){
        return res.status(403).json({
            message: "Only owner can Delete Workspace",
        });
    };

    await workspace.deleteOne();

    res.status(200).json({
      message: "Workspace deleted successfully",
    });

    } catch (err) {
        res.status(500).json({
      message: "Failed to delete workspace",
    });
    }
}

module.exports = { createWorkspace, getUserWorkspaces, inviteUsertoWorkspace, getSingleWorkspace, removeWorkspaceMember, updateWorkspace, deleteWorkspace };
