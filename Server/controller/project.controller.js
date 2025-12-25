import Project from "../models/project.model.js";

// Create Project
export const createProject = async (req, res) => {
    const { title, description } = req.body;
    const project = await Project.create({ title, description, owner: req.user._id });
    res.status(201).json(project);
};

// Get Projects for User
export const getProjects = async (req, res) => {
    const projects = await Project.find({ "members.user": req.user._id }).populate("owner", "name email");
    res.json(projects);
};
