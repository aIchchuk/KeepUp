import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
    addedAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Cart", cartSchema);
