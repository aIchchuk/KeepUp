import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
    amount: { type: Number, required: true },
    stripePaymentId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Purchase", purchaseSchema);
