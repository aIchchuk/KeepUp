import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { initiatePayment, verifyPayment } from "../controller/esewa.controller.js";

const router = express.Router();

router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, verifyPayment);

export default router;
