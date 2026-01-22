import crypto from 'crypto';
import Purchase from '../models/purchase.model.js';
import Template from '../models/template.model.js';

// Esewa Configuration (Test Environment)
const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // For verifying, usually separate API in prod
const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q"; // Test Secret Key

// Generate Signature
const createSignature = (message) => {
    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    hmac.update(message);
    return hmac.digest("base64");
};

// Initiate Payment
export const initiatePayment = async (req, res) => {
    try {
        const { templateId, amount } = req.body;
        const userId = req.user._id;

        const template = await Template.findById(templateId);
        if (!template) return res.status(404).json({ message: "Template not found" });

        // Create a unique Transaction UUID
        const transactionUuid = `${userId}-${Date.now()}`;

        // Create a pending purchase record
        const purchase = await Purchase.create({
            user: userId,
            template: templateId,
            amount,
            transactionUuid,
            status: "PENDING"
        });

        // Prepare Signature
        // Message format: "total_amount,transaction_uuid,product_code"
        const signatureMessage = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
        const signature = createSignature(signatureMessage);

        const paymentConfig = {
            amount: amount,
            failure_url: `http://localhost:5173/payment/failure`,
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: ESEWA_PRODUCT_CODE,
            signature: signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: `http://localhost:5173/payment/success`, // Frontend URL that will call verification
            tax_amount: "0",
            total_amount: amount,
            transaction_uuid: transactionUuid,
            url: ESEWA_URL
        };

        res.json({ paymentConfig, purchaseId: purchase._id });

    } catch (error) {
        console.error("Payment Initiation Error:", error);
        res.status(500).json({ message: "Failed to initiate payment" });
    }
};

// Verify Payment (Called after Esewa redirects back to success_url on frontend, frontend sends params here)
export const verifyPayment = async (req, res) => {
    try {
        const { encodedResponse } = req.body;

        // Esewa V2 returns a base64 encoded JSON in the 'data' query param on success
        let decodedData;
        try {
            const buffer = Buffer.from(encodedResponse, 'base64');
            decodedData = JSON.parse(buffer.toString('utf-8'));
        } catch (e) {
            return res.status(400).json({ message: "Invalid payment data" });
        }

        /* 
           Decoded Data Format:
           {
             "transaction_code": "...",
             "status": "COMPLETE",
             "total_amount": 100,
             "transaction_uuid": "...",
             "product_code": "EPAYTEST",
             "signed_field_names": "total_amount,transaction_uuid,product_code",
             "signature": "..."
           }
        */

        const { transaction_uuid, total_amount, status, transaction_code, signature } = decodedData;

        if (status !== 'COMPLETE') {
            return res.status(400).json({ message: "Payment not complete" });
        }

        // Verify Signature again to ensure data integrity
        const signatureMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
        const expectedSignature = createSignature(signatureMessage);

        if (signature !== expectedSignature) {
            return res.status(400).json({ message: "Integrity error: Signature mismatch" });
        }

        // Update Purchase Record
        const purchase = await Purchase.findOne({ transactionUuid: transaction_uuid });
        if (!purchase) return res.status(404).json({ message: "Purchase record not found" });

        purchase.status = "COMPLETE";
        purchase.esewaRefId = transaction_code;
        await purchase.save();

        // Unlock logic could go here (e.g., adding template to user's library)

        res.json({ message: "Payment verified successfully", purchase });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};
