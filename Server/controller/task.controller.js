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
    const { title, description, status, priority, dueDate, assignedTo, type, parentId, content } = req.body;

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
        project: id,
        type: type || 'task',
        parentId: parentId || null,
        content: content || ''
    });

    await Activity.create({
        user: req.user._id,
        actionType: "task_create",
        metadata: { taskId: task._id, projectId: id },
        ipAddress: req.ip
    });

    res.status(201).json(task);
};

// Update task
export const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo, type, content } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Item not found" });

        // Security: Check project membership
        const project = await Project.findById(task.project);
        if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;
        task.assignedTo = assignedTo || task.assignedTo;
        task.type = type || task.type;
        task.content = content !== undefined ? content : task.content;

        await task.save();

        await Activity.create({
            user: req.user._id,
            actionType: "task_update",
            metadata: { taskId: task._id, projectId: task.project },
            ipAddress: req.ip
        });

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete task
export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Item not found" });

        // Security: Check project membership
        const project = await Project.findById(task.project);
        if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Task.findByIdAndDelete(taskId);

        // Optional: Delete children if it was a list or page (recursive)
        if (task.type === 'list' || task.type === 'page') {
            await Task.deleteMany({ parentId: taskId });
        }

        await Activity.create({
            user: req.user._id,
            actionType: "task_delete",
            metadata: { taskId: taskId, projectId: task.project },
            ipAddress: req.ip
        });

        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

