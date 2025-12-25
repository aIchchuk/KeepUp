import Template from "../models/template.model.js";

// List all templates
export const getTemplates = async (req, res) => {
    const templates = await Template.find().populate("author", "name email");
    res.json(templates);
};

// Buy template (placeholder)
export const buyTemplate = async (req, res) => {
    const { templateId } = req.body;
    // Here, integrate Stripe payment and then mark purchased
    res.json({ message: `Template ${templateId} purchase endpoint - implement Stripe logic` });
};
