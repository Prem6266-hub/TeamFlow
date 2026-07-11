const express = require("express");

const dashRouter = express.Router();

const {protect, validate} = require("../middlewares/auth.middleware");

const {getWorkspaceAnalytics, getMemberProductivity, getProjectsProgress} = require("../controllers/dashboard.controller");

dashRouter.get("/workspace/:workSpaceId", protect, getWorkspaceAnalytics);
dashRouter.get("/workspace/:workSpaceId/members", protect, getMemberProductivity);
dashRouter.get("/workspace/:workSpaceId/projects", protect, getProjectsProgress);


module.exports = dashRouter;