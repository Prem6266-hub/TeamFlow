const express = require("express");

const taskRouter = express.Router();

const{protect, validate} = require("../middlewares/auth.middleware");
const {createTask, getProjectTasks, getSingleTask, updateTask, updateTaskStatus, deleteTask} = require("../controllers/task.controller");
const {createTaskSchema,updateTaskSchema, updateTaskStatusSchema} = require("../validators/task.validator")

taskRouter.post("/create", protect, validate(createTaskSchema), createTask);
taskRouter.get("/project/:projectId", protect, getProjectTasks);
taskRouter.get("/:taskId", protect, getSingleTask);
taskRouter.put("/:taskId", protect, validate(updateTaskSchema), updateTask);
taskRouter.patch("/:taskId/status", protect, validate(updateTaskStatusSchema), updateTaskStatus);
taskRouter.delete("/:taskId", protect, deleteTask);


module.exports = taskRouter;