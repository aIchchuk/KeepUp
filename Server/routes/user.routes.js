import express from "express";
import { registerUser, loginUser, getProfile, verifyMfa, toggleMfa } from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-mfa", verifyMfa);
router.post("/toggle-mfa", protect, toggleMfa);
router.get("/profile", protect, getProfile);

export default router;
