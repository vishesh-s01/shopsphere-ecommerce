import express from "express";
import {
    createStripeCheckout,
} from "../controllers/paymentController.js";
import checkJwt from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ express.json() removed — handled globally in app.js
router.post("/checkout", checkJwt, createStripeCheckout);


export default router;