import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getTasks, createTask, updateTask, deleteTask, uploadTaskImage } from "../controller/task.controller.js";
import upload, { uploadTo } from "../middleware/upload.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.patch("/:taskId", protect, updateTask);
router.post("/:taskId/image", protect, uploadTo("task"), upload.single("image"), uploadTaskImage);
router.delete("/:taskId", protect, deleteTask);

export default router;
