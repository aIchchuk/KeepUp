import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
    amount: { type: Number, required: true },
    transactionUuid: { type: String, required: true, unique: true }, // Unique ID for Esewa
    esewaRefId: { type: String }, // Returned from Esewa after success
    status: { type: String, enum: ["PENDING", "COMPLETE", "FAILED", "REFUNDED"], default: "PENDING" },
    paymentMethod: { type: String, default: "ESEWA" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Purchase", purchaseSchema);
