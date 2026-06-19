import dotenv from "dotenv";
dotenv.config();

import stripe from "../config/stripe.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/productModel.js";

export const stripeWebhook = async (req, res) => {
  console.log("🔥 WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Event type:", event.type);
  } catch (err) {
    console.log("❌ Signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ---------------------------
  // 1. PAYMENT SUCCESS
  // ---------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;

    console.log("📦 Order:", orderId);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "paid",
        stripePaymentIntentId: session.payment_intent, // ✅ IMPORTANT FIX
      },
      { new: true }
    );

    for (const item of updatedOrder.items) {
  await Product.findByIdAndUpdate(
    item.productId,
    {
      $inc: {
        stock: -item.quantity,
      },
    }
  );
}

    console.log("📝 Order paid:", updatedOrder?._id);

    await Cart.findOneAndDelete({ userId });

    console.log("🗑 Cart deleted");
  }

  // ---------------------------
  // 2. REFUND EVENT
  // ---------------------------
  if (event.type === "charge.refunded") {
    const charge = event.data.object;

    console.log("💸 REFUND EVENT RECEIVED");

    const paymentIntentId = charge.payment_intent;

    const updatedOrder = await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        paymentStatus: "refunded",
        refundedAt: new Date(),
      },
      { new: true }
    );

    console.log("🔄 Order refunded:", updatedOrder?._id);
  }

  // ✅ ALWAYS SEND RESPONSE AT END
  res.json({ received: true });
};