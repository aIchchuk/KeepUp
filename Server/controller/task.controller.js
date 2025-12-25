import Task from "../models/task.model.js";

// Get tasks for a project
export const getTasks = async (req, res) => {
    const { id } = req.params; // projectId
    const tasks = await Task.find({ project: id });
    res.json(tasks);
};

// Create task
export const createTask = async (req, res) => {
    const { id } = req.params; // projectId
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
        project: id
    });

    res.status(201).json(task);
};
