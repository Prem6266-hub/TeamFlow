const express = require("express");

const projectRouter = express.Router();

const {createProjectController, getWorkspaceProjects, getSingleProject, updateProject, deleteProject} = require("../controllers/project.controller");
const {createProjectSchema, updateProjectSchema} = require("../validators/project.validator");
const {protect, validate} = require("../middlewares/auth.middleware")

projectRouter.post("/create", protect, validate(createProjectSchema), createProjectController);
projectRouter.get("/workspace/:workSpaceId", protect, getWorkspaceProjects);
projectRouter.get("/:projectId", protect, getSingleProject);
projectRouter.put("/:projectId", protect, validate(updateProjectSchema), updateProject);
projectRouter.delete("/:projectId", protect,deleteProject);

module.exports = projectRouter;