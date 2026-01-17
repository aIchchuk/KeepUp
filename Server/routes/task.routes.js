import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getTasks, createTask, updateTask, deleteTask } from "../controller/task.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.patch("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

export default router;
