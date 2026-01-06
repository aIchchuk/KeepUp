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

        project.members.push({ user: userToInvite._id, role: "viewer" });
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

