import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { initiatePayment, verifyPayment } from "../controller/esewa.controller.js";
import { initializeKhalti, verifyKhalti } from "../controller/payment.controller.js";

const router = express.Router();

// Esewa
router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, verifyPayment);

// Khalti
router.post("/khalti/initiate", protect, initializeKhalti);
router.post("/khalti/verify", protect, verifyKhalti);

export default router;
