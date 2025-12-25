import Activity from "../models/activity.model.js";

export const getActivityLogs = async (req, res) => {
    const logs = await Activity.find().populate("user", "name email");
    res.json(logs);
};
