import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actionType: { type: String, required: true }, // e.g., "login", "task_create", "template_purchase"
    metadata: Object, // any extra info (taskId, templateId, IP, etc.)
    ipAddress: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Activity", activitySchema);
