const Joi = require("joi");

const createTaskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().required(),
    projectId: Joi.string().required(),
    assignedTo: Joi.string().required(),
    priority: Joi.string()
    .valid("low", "medium", "high")
    .optional(),

  dueDate: Joi.date().optional(),
});

const updateTaskSchema = Joi.object({
    title: Joi.string().min(3),
    description: Joi.string(),
    assignedTo: Joi.string(),
    priority: Joi.string().valid("low","medium","high"),
    dueDate: Joi.date(),
})

const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid(
    "todo",
    "in_progress",
    "review",
    "completed"
  ).required(),
});

const addCommentSchema = Joi.object({
  text: Joi.string().min(1).required(),
})

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  addCommentSchema
};