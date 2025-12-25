import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    structure: Object, // JSON representing tasks/sections
    price: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // optional, track purchases
});

export default mongoose.model("Template", templateSchema);
