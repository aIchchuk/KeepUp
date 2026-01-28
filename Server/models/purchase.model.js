import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
    amount: { type: Number, required: true },
    transactionUuid: { type: String, required: true, unique: true }, // Internal order reference
    pidx: { type: String }, // Khalti unique identifier
    paymentId: { type: String }, // Final transaction ID from Khalti
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED", "EXPIRED", "REFUNDED"], default: "PENDING" },
    paymentMethod: { type: String, enum: ["ESEWA", "KHALTI"], default: "KHALTI" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Purchase", purchaseSchema);
