const express = require("express");
const {protect} = require("../middlewares/auth.middleware");
const {generateTasks} = require("../controllers/ai.controller");

const aiRouter = express.Router();

aiRouter.post("/generate-task", protect, generateTasks);

module.exports = aiRouter;