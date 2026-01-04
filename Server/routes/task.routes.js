import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getTasks, createTask } from "../controller/task.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", protect, getTasks);
router.post("/", protect, createTask);

export default router;
