import express from "express";
import { registerUser, loginUser, getProfile, verifyMfa, toggleMfa, updateProfile, uploadProfileImage } from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload, { uploadTo } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-mfa", verifyMfa);
router.post("/toggle-mfa", protect, toggleMfa);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.post("/profile/image", protect, uploadTo("user"), upload.single("image"), uploadProfileImage);

export default router;
