import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getTemplates, buyTemplate, publishTemplate, updateTemplate, deleteTemplate } from "../controller/template.controller.js";

const router = express.Router();

router.get("/", protect, getTemplates);
router.post("/publish", protect, publishTemplate);
router.post("/buy", protect, buyTemplate); // Stripe integration later
router.put("/:id", protect, updateTemplate);
router.delete("/:id", protect, deleteTemplate);

export default router;
