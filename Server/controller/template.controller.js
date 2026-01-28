import Template from "../models/template.model.js";
import Activity from "../models/activity.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";


// List all templates
export const getTemplates = async (req, res) => {
    const templates = await Template.find().populate("author", "name email");
    res.json(templates);
};

// Buy template (Create Project from Template)
export const buyTemplate = async (req, res) => {
    try {
        const { templateId } = req.body;

        // 1. Find the template
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // 2. Create a new Project for the user
        const newProject = await Project.create({
            title: template.title,
            description: template.description,
            owner: req.user._id,
            icon: template.structure.projectSettings?.icon || "🚀",
            coverImage: template.structure.projectSettings?.coverImage,
            members: [{ user: req.user._id, role: "owner", isPinned: false }]
        });

        // 3. Clone Tasks
        const sourceTasks = template.structure.tasks || [];
        const oldIdToNewIdMap = {};

        // Generate new IDs
        sourceTasks.forEach(task => {
            if (task._id) {
                oldIdToNewIdMap[task._id] = new mongoose.Types.ObjectId();
            }
        });

        // Prepare tasks for insertion
        const tasksToInsert = sourceTasks.map(sourceTask => {
            // If explicit mapping exists use it, otherwise generate new ID
            const newId = sourceTask._id && oldIdToNewIdMap[sourceTask._id]
                ? oldIdToNewIdMap[sourceTask._id]
                : new mongoose.Types.ObjectId();

            // Resolve parentId
            let newParentId = null;
            if (sourceTask.parentId && oldIdToNewIdMap[sourceTask.parentId]) {
                newParentId = oldIdToNewIdMap[sourceTask.parentId];
            }

            return {
                _id: newId,
                title: sourceTask.title,
                description: sourceTask.description,
                status: sourceTask.status || "todo",
                priority: sourceTask.priority || "medium",
                type: sourceTask.type || "task",
                content: sourceTask.content,
                icon: sourceTask.icon,
                coverImage: sourceTask.coverImage,
                // Do not copy assignedTo, assign to current user
                assignedTo: req.user._id,
                project: newProject._id,
                parentId: newParentId,
                dueDate: null // Reset due date
            };
        });

        if (tasksToInsert.length > 0) {
            await Task.insertMany(tasksToInsert);
        }

        // 4. Record Purchase (Activity + Template tracking)
        if (!template.purchasedBy.includes(req.user._id)) {
            template.purchasedBy.push(req.user._id);
            await template.save();
        }

        await Activity.create({
            user: req.user._id,
            actionType: "template_purchase",
            metadata: {
                templateId: template._id,
                templateTitle: template.title,
                newProjectId: newProject._id
            },
            ipAddress: req.ip
        });

        res.json({
            message: "Purchase successful! Project added to your Dashboard.",
            projectId: newProject._id
        });

    } catch (err) {
        console.error("Purchase Error:", err);
        res.status(500).json({ message: "Purchase failed", error: err.message });
    }
};

// Publish Project as Template
export const publishTemplate = async (req, res) => {
    const { projectId, price, title, description } = req.body;

    try {
        // 1. Verify Ownership
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the project owner can publish this template" });
        }

        // 2. Fetch all tasks to include in structure (Include _id for hierarchy reconstruction)
        const tasks = await Task.find({ project: projectId }).select('title description status priority type content parentId icon coverImage').lean();

        // 3. Create Template
        const template = await Template.create({
            title: title || project.title,
            description: description || project.description,
            price: Number(price) || 0,
            author: req.user._id,
            structure: {
                tasks: tasks, // Store the tasks array directly
                projectSettings: {
                    icon: project.icon,
                    coverImage: project.coverImage
                }
            }
        });

        // 4. Log Activity
        await Activity.create({
            user: req.user._id,
            actionType: "template_publish",
            metadata: { templateId: template._id, sourceProjectId: projectId },
            ipAddress: req.ip
        });

        res.status(201).json(template);

    } catch (err) {
        console.error("Publish Error:", err);
        res.status(500).json({ message: "Failed to publish template", error: err.message });
    }
};

// Update Template
export const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price } = req.body;

        // 1. Find template
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ message: "Template not found" });

        // 2. Verify ownership
        if (template.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the author can update this template" });
        }

        // 3. Update fields
        if (title !== undefined) template.title = title;
        if (description !== undefined) template.description = description;
        if (price !== undefined) template.price = Number(price);

        await template.save();

        // 4. Log activity
        await Activity.create({
            user: req.user._id,
            actionType: "template_update",
            metadata: { templateId: template._id },
            ipAddress: req.ip
        });

        res.json(template);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Failed to update template", error: err.message });
    }
};

// Delete Template
export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find template
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ message: "Template not found" });

        // 2. Verify ownership
        if (template.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the author can delete this template" });
        }

        // 3. Delete template
        await Template.findByIdAndDelete(id);

        // 4. Log activity
        await Activity.create({
            user: req.user._id,
            actionType: "template_delete",
            metadata: { templateId: id, templateTitle: template.title },
            ipAddress: req.ip
        });

        res.json({ message: "Template deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Failed to delete template", error: err.message });
    }
};
