const mongoose = require('mongoose');

const workSpaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description:{
            type:String,
            default: ""
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },
        members: [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ]
    },
    {
        timestamps: true,
    }
)

const workSpace = mongoose.model("WorkSpace", workSpaceSchema);

module.exports = workSpace;