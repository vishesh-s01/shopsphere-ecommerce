import express from "express";
import checkJwt from "../middleware/authMiddleware.js";
import { getSellerAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", checkJwt, getSellerAnalytics);

export default router;