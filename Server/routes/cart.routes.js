import express from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controller/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/remove/:templateId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
