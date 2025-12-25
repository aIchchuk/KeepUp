import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getActivityLogs } from "../controllers/activity.controller.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getActivityLogs);

export default router;
