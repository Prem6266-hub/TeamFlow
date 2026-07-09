const Joi = require("joi");

const createWorkSpaceSchema = Joi.object({
    name: Joi.string().min(3).required(),

    description: Joi.string().allow("").optional()
});

const inviteMemberSchema = Joi.object({
    email: Joi.string().email().required()
});

const updatedWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().allow("")
});

module.exports = {createWorkSpaceSchema,inviteMemberSchema, updatedWorkspaceSchema};