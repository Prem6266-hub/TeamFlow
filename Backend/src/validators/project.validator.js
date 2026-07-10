const Joi = require("joi");

const createProjectSchema = Joi.object({
    name: Joi.string().min(3).required(),

    description: Joi.string().allow("").optional(),

    workSpaceId: Joi.string().required(),
});

const updateProjectSchema = Joi.object({
    name: Joi.string().min(3),

    description: Joi.string().allow(""),
})

module.exports = {createProjectSchema, updateProjectSchema};