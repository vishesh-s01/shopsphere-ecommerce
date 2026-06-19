import express from "express";
import checkJwt from "../middleware/authMiddleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", checkJwt, getWishlist);
router.post("/add", checkJwt, addToWishlist);
router.delete("/:productId", checkJwt, removeFromWishlist);

export default router;