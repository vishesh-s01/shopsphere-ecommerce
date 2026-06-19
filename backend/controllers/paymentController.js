import dotenv from "dotenv";
dotenv.config();

import stripe from "../config/stripe.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/productModel.js";

// CREATE CHECKOUT SESSION
export const createStripeCheckout = async (req, res) => {
  
  try {
    
    const userId = req.auth.payload.sub;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }
for (const item of cart.items) {
  if (!item.productId) {
    return res.status(400).json({
      message: `${item.title} missing productId`,
    });
  }

  const product = await Product.findById(item.productId);

  if (!product) {
    return res.status(400).json({
      message: `${item.title} no longer exists`,
    });
  }

  if (product.stock < item.quantity) {
    return res.status(400).json({
      message: `${product.title} has only ${product.stock} left in stock`,
    });
  }
}

    const { shippingAddress } = req.body;

    const order = await Order.create({
      userId,

      items: cart.items,

      totalAmount: cart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),

      shippingAddress,

      orderStatus: "order_placed",

      paymentStatus: "pending",

      stripeSessionId: null,
    });

    console.log("NEW CHECKOUT CODE RUNNING");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      line_items: cart.items.map((item) => ({
        price_data: {
          currency: "inr",

          product_data: {
            name: item.title,
          },

          unit_amount: item.price * 100,
        },

        quantity: item.quantity,
      })),

success_url: `${process.env.CLIENT_URL}/payment-result?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,

cancel_url: `${process.env.CLIENT_URL}/cart`,

      metadata: {
        userId,
        orderId: order._id.toString(),
      },
    });

    order.stripeSessionId = session.id;

    order.stripePaymentIntentId =
      session.payment_intent || null;

    await order.save();

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Stripe error",
    });
  }
};
