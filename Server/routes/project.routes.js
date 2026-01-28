import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createProject, getProjects, getProjectById, inviteMember, updateProject, togglePin } from "../controller/project.controller.js";


const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.patch("/:id", protect, updateProject);
router.post("/:id/invite", protect, inviteMember);
router.patch("/:id/pin", protect, togglePin);


export default router;
