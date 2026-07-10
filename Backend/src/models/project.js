const { required } = require("joi");
const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description:{
            type: String,
            default: ""
        },
        workspace:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkSpace",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;