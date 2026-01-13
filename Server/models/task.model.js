import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    type: { type: String, enum: ["task", "list", "page"], default: "task" },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    content: { type: String }, // For page type
    dueDate: Date,
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Task", taskSchema);
