import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Activity from "../models/activity.model.js";


// Get tasks for a project
export const getTasks = async (req, res) => {
    const { id } = req.params; // projectId

    // Security Fix: Check if user is a member of the project
    const project = await Project.findById(id);
    if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: "Not authorized to access this project" });
    }

    const tasks = await Task.find({ project: id });
    res.json(tasks);
};


// Create task
export const createTask = async (req, res) => {
    const { id } = req.params; // projectId
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Security Fix: Check if user is a member of the project
    const project = await Project.findById(id);
    if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: "Not authorized to access this project" });
    }

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
        project: id
    });

    await Activity.create({
        user: req.user._id,
        actionType: "task_create",
        metadata: { taskId: task._id, projectId: id },
        ipAddress: req.ip
    });

    res.status(201).json(task);
};

