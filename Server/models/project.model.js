import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["owner", "editor", "viewer"], default: "viewer" }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", projectSchema);
