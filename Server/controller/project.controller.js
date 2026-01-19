import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";



// Create Project
export const createProject = async (req, res) => {
    const { title, description } = req.body;
    const project = await Project.create({
        title,
        description,
        owner: req.user._id,
        members: [{ user: req.user._id, role: "owner" }]
    });

    await Activity.create({
        user: req.user._id,
        actionType: "project_create",
        metadata: { projectId: project._id },
        ipAddress: req.ip
    });

    res.status(201).json(project);
};



// Get Projects for User
export const getProjects = async (req, res) => {
    const projects = await Project.find({ "members.user": req.user._id }).populate("owner", "name email");
    res.json(projects);
};

// Update Project
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, icon, coverImage } = req.body;

    try {
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Only owner or members can update
        const isMember = project.members.some(member => member.user.toString() === req.user._id.toString());
        if (!isMember && project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this project" });
        }

        if (title) project.title = title;
        if (description !== undefined) project.description = description;
        if (icon) project.icon = icon;
        if (coverImage) project.coverImage = coverImage;

        await project.save();

        await Activity.create({
            user: req.user._id,
            actionType: "project_update",
            metadata: { projectId: id, updates: { title, icon, coverImage } },
            ipAddress: req.ip
        });

        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Invite Member
export const inviteMember = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    try {
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ message: "User not found" });

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check if already a member
        const isMember = project.members.some(member => member.user.toString() === userToInvite._id.toString());
        if (isMember) return res.status(400).json({ message: "User is already a member" });

        project.members.push({ user: userToInvite._id, role: "member" });
        await project.save();

        await Activity.create({
            user: req.user._id,
            actionType: "project_invite",
            metadata: { projectId: id, invitedUserId: userToInvite._id },
            ipAddress: req.ip
        });

        res.json({ message: "User invited successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

