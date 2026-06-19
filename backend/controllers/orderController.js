import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Create order from cart snapshot
items: cart.items.map((item) => ({
  productId: item.productId,
  title: item.title,
  image: item.image,
  price: item.price,
  quantity: item.quantity,
  sellerId: item.sellerId,
  sellerName: item.sellerName,
})),

    await order.save();

    // Clear cart after order creation
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const seller = await User.findOne({ auth0Id });

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const orders = await Order.find({
      "items.sellerId": auth0Id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch seller orders",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { orderStatus } = req.body;

    const allowedStatuses = [
      "order_placed",
      "processing",
      "ready_to_ship",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update order status",
    });
  }
};

export const getSellerOrderById = async (req, res) => {
  try {
    const sellerId = req.auth.payload.sub;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const sellerHasProduct = order.items.some(
      (item) => item.sellerId === sellerId
    );

    if (!sellerHasProduct) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

