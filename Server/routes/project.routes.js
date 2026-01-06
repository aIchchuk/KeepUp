import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createProject, getProjects, inviteMember } from "../controller/project.controller.js";


const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.post("/:id/invite", protect, inviteMember);


export default router;
