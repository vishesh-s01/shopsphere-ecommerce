import express from "express";
import { stripeWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Stripe webhook endpoint (NO auth middleware)
router.post("/", stripeWebhook);

export default router;