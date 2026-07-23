const express = require("express");
const {protect} = require("../middlewares/auth.middleware");
const {generateTasks, chatWithAi} = require("../ai/ai.controller");

const aiRouter = express.Router();

aiRouter.post("/generate-tasks", protect, generateTasks);
aiRouter.post("/chat",protect, chatWithAi);

module.exports = aiRouter;