import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["owner", "member"], default: "member" },
        isPinned: { type: Boolean, default: false }
    }],
    coverImage: { type: String, default: "/public/images/default/project.png" },
    icon: { type: String, default: "🚀" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", projectSchema);
