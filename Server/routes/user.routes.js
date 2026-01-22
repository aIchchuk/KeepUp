import express from "express";
import multer from "multer";
import path from "path";
import { registerUser, loginUser, getProfile, verifyMfa, toggleMfa, updateProfile, uploadProfileImage } from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/userImages");
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Images Only!");
        }
    }
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-mfa", verifyMfa);
router.post("/toggle-mfa", protect, toggleMfa);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.post("/profile/image", protect, upload.single("image"), uploadProfileImage);

export default router;
