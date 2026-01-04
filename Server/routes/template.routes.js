import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getTemplates, buyTemplate } from "../controller/template.controller.js";

const router = express.Router();

router.get("/", protect, getTemplates);
router.post("/buy", protect, buyTemplate); // Stripe integration later

export default router;
