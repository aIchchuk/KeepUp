import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getTemplates, buyTemplate, publishTemplate, updateTemplate, deleteTemplate, uploadTemplateImage } from "../controller/template.controller.js";
import upload, { uploadTo } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protect, getTemplates);
router.post("/publish", protect, publishTemplate);
router.post("/buy", protect, buyTemplate); // Stripe integration later
router.put("/:id", protect, updateTemplate);
router.post("/:id/image", protect, uploadTo("template"), upload.single("image"), uploadTemplateImage);
router.delete("/:id", protect, deleteTemplate);

export default router;
