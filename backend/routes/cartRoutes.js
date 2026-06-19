import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cartController.js";

import checkJwt from "../middleware/authMiddleware.js";

const router = express.Router();

// ==============================
// CART ROUTES (PROTECTED)
// ==============================

// Add item to cart
router.post("/", checkJwt, addToCart);

// Get user cart
router.get("/", checkJwt, getCart);

// Remove item from cart
router.delete("/:productId", checkJwt, removeFromCart);

router.put("/", checkJwt, updateCartItemQuantity);

export default router;