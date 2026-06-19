import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { stripeWebhook } from "./controllers/webhookController.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(cors());


// ✅ JSON body for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") return next();
  express.json()(req, res, next);
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API Running",
  });
});
app.use(
  "/uploads",
  express.static("uploads")
);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/wishlist", wishlistRoutes);

export default app;