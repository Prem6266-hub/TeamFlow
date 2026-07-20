const express = require("express");

const workRouter = express.Router();

const {protect, validate} = require("../middlewares/auth.middleware");

const {createWorkspace, getUserWorkspaces, inviteUsertoWorkspace, getSingleWorkspace, removeWorkspaceMember, updateWorkspace, deleteWorkspace, getWorkspaceMembers, getWorkspaceActivities, clearWorkspaceActivities} = require("../controllers/workspace.controller");

const {createWorkSpaceSchema,inviteMemberSchema, updatedWorkspaceSchema} = require("../validators/workSpace.validator");

workRouter.post("/", protect, validate(createWorkSpaceSchema), createWorkspace);
workRouter.get("/", protect, getUserWorkspaces);
workRouter.get("/:workSpaceId", protect, getSingleWorkspace);
workRouter.get("/:workSpaceId/members", protect, getWorkspaceMembers);
workRouter.get("/:workSpaceId/activities", protect, getWorkspaceActivities);
workRouter.delete("/:workSpaceId/activities", protect, clearWorkspaceActivities);
workRouter.post("/:workSpaceId/invite", protect, validate(inviteMemberSchema), inviteUsertoWorkspace);
workRouter.delete("/:workSpaceId/members/:memberId", protect, removeWorkspaceMember);
workRouter.put("/:workSpaceId",protect, validate(updatedWorkspaceSchema), updateWorkspace);
workRouter.delete("/:workSpaceId", protect, deleteWorkspace);


module.exports = workRouter;