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

// Update task/list/page
export const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo, content } = req.body;

    console.log(`[Update Item] Request for ID: ${taskId}`);

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            console.warn(`[Update Item] Item ${taskId} not found`);
            return res.status(404).json({ message: "Item not found" });
        }

        console.log(`[Update Item] Found item: ${task.title} (${task.type})`);

        // Security: Check project membership
        const project = await Project.findById(task.project);
        if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
            console.warn(`[Update Item] Security mismatch for user ${req.user._id}`);
            return res.status(403).json({ message: "Not authorized to modify this item" });
        }

        // Update fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (content !== undefined) task.content = content;

        await task.save();
        console.log(`[Update Item] Successfully saved item ${taskId}`);

        await Activity.create({
            user: req.user._id,
            actionType: "task_update",
            metadata: { taskId: task._id, projectId: task.project, type: task.type },
            ipAddress: req.ip
        });

        res.json(task);
    } catch (err) {
        console.error("[Update Item] Error:", err);
        res.status(500).json({ message: "Failed to update item", error: err.message });
    }
};

// Delete task/list/page
export const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    console.log(`[Delete Item] Request for ID: ${taskId}`);

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            console.warn(`[Delete Item] Item ${taskId} not found`);
            return res.status(404).json({ message: "Item not found" });
        }

        console.log(`[Delete Item] Found item to delete: ${task.title} (${task.type})`);

        // Security: Check project membership
        const project = await Project.findById(task.project);
        if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
            console.warn(`[Delete Item] Security mismatch for user ${req.user._id}`);
            return res.status(403).json({ message: "Not authorized to delete this item" });
        }

        const itemType = task.type;
        const projectId = task.project;

        // Delete the item itself
        await Task.findByIdAndDelete(taskId);
        console.log(`[Delete Item] Deleted item ${taskId}`);

        // Recursive cleanup: If it's a list or page, delete all sub-items
        if (itemType === 'list' || itemType === 'page') {
            const deletedSubItems = await Task.deleteMany({ parentId: taskId });
            console.log(`[Delete Item] Cleanup: Deleted ${deletedSubItems.deletedCount} sub-items of ${itemType} ${taskId}`);
        }

        await Activity.create({
            user: req.user._id,
            actionType: "task_delete",
            metadata: { taskId: taskId, projectId: projectId, type: itemType },
            ipAddress: req.ip
        });

        res.json({ message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully` });
    } catch (err) {
        console.error("[Delete Item] Error:", err);
        res.status(500).json({ message: "Failed to delete item", error: err.message });
    }
};

