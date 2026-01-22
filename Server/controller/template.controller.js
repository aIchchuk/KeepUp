import Template from "../models/template.model.js";
import Activity from "../models/activity.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";


// List all templates
export const getTemplates = async (req, res) => {
    const templates = await Template.find().populate("author", "name email");
    res.json(templates);
};

// Buy template (placeholder)
export const buyTemplate = async (req, res) => {
    const { templateId } = req.body;
    // Here, integrate Stripe payment and then mark purchased

    await Activity.create({
        user: req.user._id,
        actionType: "template_purchase",
        metadata: { templateId },
        ipAddress: req.ip
    });

    res.json({ message: `Template ${templateId} purchase endpoint - implement Stripe logic` });

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

        // 2. Fetch all tasks to include in structure
        const tasks = await Task.find({ project: projectId }).select('title description status priority type content parentId -_id');

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
