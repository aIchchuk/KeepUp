import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createProject, getProjects } from "../controller/project.controller.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);

export default router;
