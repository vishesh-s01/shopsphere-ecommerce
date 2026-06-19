import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/productController.js";

import checkJwt from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", checkJwt, getAllProducts);
router.get(
  "/my-products",
  checkJwt,
  getMyProducts
);
router.get("/:id", checkJwt, getProductById);

router.post(
  "/",
  checkJwt,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  checkJwt,
  upload.single("image"),
  updateProduct
);
router.delete("/:id", checkJwt, deleteProduct);

export default router;