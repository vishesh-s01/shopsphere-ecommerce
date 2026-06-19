import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  getSellerOrderById,
} from "../controllers/orderController.js";

import checkJwt from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", checkJwt, createOrder);

router.get("/my-orders", checkJwt, getMyOrders);

router.get("/seller/all", checkJwt, getSellerOrders);

router.get("/seller/:id", checkJwt, getSellerOrderById);

router.put("/:id/status", checkJwt, updateOrderStatus);

router.get("/:id", checkJwt, getOrderById);

export default router;