const {generateTasksWithAI} = require("../services/ai.service");
const Task = require("../models/task");
const Project = require("../models/project");
const workSpace = require("../models/workspace");
const createNotification = require("../utils/createNotification");

const generateTasks = async(req,res) => {
    try {
        const {projectTitle, projectId} = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(400).json({
                message: "Project not found",
            });
        }

        const workspace = await workSpace.findById(project.workspace)
            .populate("members", "name skill email")
            .populate("owner", "name skill email");

        if (!workspace) {
            return res.status(400).json({
                message: "Workspace not found",
            });
        }

        const teamMembers = workspace.members.map(member => ({
            name: member.name,
            skill: member.skill,
            id: member._id,
        }));

        const result = await generateTasksWithAI(projectTitle, teamMembers);
        

        const memberMap = {};

        teamMembers.forEach(member => {
            memberMap[member.name.trim().toLowerCase()] = member;
        })

        

        const createdTasks = [];

        for (const task of result.tasks) {
            const normalizedAssignedTo = (task.assignedTo || "").trim().toLowerCase();
            let assignedMember = memberMap[normalizedAssignedTo];

            if (!assignedMember && normalizedAssignedTo) {
                assignedMember = teamMembers.find((member) => {
                    const memberName = member.name.trim().toLowerCase();
                    return normalizedAssignedTo.includes(memberName) || memberName.includes(normalizedAssignedTo);
                });
            }

            const assignedUserId = assignedMember?._id || workspace.owner;

            const newTask = await Task.create({
                title: task.title,
                description: task.description,
                priority: task.priority,
                category: task.category,
                project: project._id,
                workspace: project.workspace,
                assignedTo: assignedMember.id,
                createdBy: req.user._id
            });

            console.log(
  "Saving task for:",
  assignedMember.id
);

            if (assignedUserId) {
                await createNotification({
                    recipient: assignedUserId,
                    sender: req.user._id,
                    message: "You've been assigned a task",
                    type: "TASK_ASSIGNED",
                    io: req.app.get("io"),
                    relatedWorkspace: project.workspace,
                    relatedTask: newTask._id,
                });
            }

            createdTasks.push(newTask);
        }

        res.status(200).json({
            message: "Tasks generated successfully",
            tasks: createdTasks,
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Failed to generate tasks",
        });
    }
}


module.exports = {generateTasks};